(function () {
  const config = window.BABY_SHOWER_CONFIG || {};
  const modal = document.getElementById("rsvp-modal");
  const openBtn = document.getElementById("rsvp-open");
  const closeBtn = document.getElementById("rsvp-close");
  const form = document.getElementById("rsvp-form");
  const statusEl = document.getElementById("form-status");
  const guestsLabel = document.getElementById("guests-label");
  const submitBtn = document.getElementById("rsvp-submit");
  const contactPhone = config.contactPhone || "+12093155702";
  const contactEmail = config.formSubmitEmail || "andrewjamesmartinez91@gmail.com";

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    form.querySelector('input[name="name"]')?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  openBtn?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  form?.querySelectorAll('input[name="attending"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const attending = form.querySelector('input[name="attending"]:checked')?.value;
      if (guestsLabel) {
        guestsLabel.style.display = attending === "yes" ? "block" : "none";
      }
    });
  });

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "form-status " + type;
    statusEl.hidden = false;
  }

  function showStatusHtml(html, type) {
    statusEl.innerHTML = html;
    statusEl.className = "form-status " + type;
    statusEl.hidden = false;
  }

  /** Apps Script web apps often 302 → opaque CORS; fire-and-forget still delivers the POST. */
  function submitToAppsScript(data) {
    const url = config.rsvpScriptUrl;
    if (!url) return Promise.resolve({ ok: false, reason: "missing-url" });

    // Prefer readable CORS response when available (text/plain avoids preflight issues).
    return fetch(url, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        try {
          const json = await res.json();
          if (json && json.ok) return { ok: true, path: "apps-script-cors" };
        } catch (_) {
          /* opaque / non-JSON after redirect — treat as delivered if status ok-ish */
        }
        if (res.ok || res.type === "opaqueredirect" || res.status === 0) {
          return { ok: true, path: "apps-script-opaque" };
        }
        return { ok: false, reason: "http-" + res.status };
      })
      .catch(() => {
        // Last resort: no-cors POST (response unreadable, but request usually reaches doPost).
        return fetch(url, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        })
          .then(() => ({ ok: true, path: "apps-script-no-cors" }))
          .catch((err) => ({ ok: false, reason: String(err) }));
      });
  }

  function submitToFormSubmit(data) {
    const email = config.formSubmitEmail;
    if (!email) return Promise.resolve({ ok: false, reason: "missing-email" });

    const attendingLabel = data.attending === "yes" ? "Attending" : "Not Attending";
    const body = new FormData();
    body.append("_subject", `Baby Shower RSVP: ${data.name} — ${attendingLabel}`);
    body.append("_template", "table");
    body.append("Name", data.name);
    body.append("Email", data.email || "(not provided)");
    body.append("Attending", attendingLabel);
    body.append("Guests", data.attending === "yes" ? String(data.guests) : "0");
    body.append("Message", data.message || "(none)");
    body.append("_captcha", "false");
    body.append("_honey", "");

    return fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: "POST",
      body,
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        let json = null;
        try {
          json = await res.json();
        } catch (_) {}
        if (res.ok && (json?.success || json?.ok || !json)) {
          return { ok: true, path: "formsubmit" };
        }
        return { ok: false, reason: json?.message || "formsubmit-failed" };
      })
      .catch((err) => ({ ok: false, reason: String(err) }));
  }

  function mailtoFallback(data) {
    const attendingLabel = data.attending === "yes" ? "Attending" : "Not Attending";
    const lines = [
      `Name: ${data.name}`,
      `Email: ${data.email || "(not provided)"}`,
      `Attending: ${attendingLabel}`,
      `Guests: ${data.attending === "yes" ? data.guests : 0}`,
      `Message: ${data.message || "(none)"}`,
    ];
    const subject = encodeURIComponent(`Baby Shower RSVP: ${data.name} — ${attendingLabel}`);
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:${encodeURIComponent(contactEmail)}?subject=${subject}&body=${body}`;
  }

  function smsFallback(data) {
    const attendingLabel = data.attending === "yes" ? "yes" : "no";
    const text = encodeURIComponent(
      `Baby Shower RSVP — ${data.name}: ${attendingLabel}, guests ${data.attending === "yes" ? data.guests : 0}`
    );
    const digits = String(contactPhone).replace(/[^\d+]/g, "");
    return `sms:${digits}?&body=${text}`;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    statusEl.hidden = true;
    statusEl.textContent = "";

    const fd = new FormData(form);
    const attending = fd.get("attending");
    const data = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      attending,
      guests: attending === "yes" ? Number(fd.get("guests") || 1) : 0,
      message: String(fd.get("message") || "").trim(),
      timestamp: new Date().toISOString(),
    };

    if (!data.name || !attending) {
      showStatus("Please enter your name and whether you can attend.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Send RSVP";
      return;
    }

    try {
      // Dual-path: try Apps Script and FormSubmit in parallel so one success is enough.
      const tasks = [];
      if (config.rsvpScriptUrl) tasks.push(submitToAppsScript(data));
      if (config.formSubmitEmail) tasks.push(submitToFormSubmit(data));

      let results = [];
      if (tasks.length) {
        results = await Promise.all(tasks);
      }

      const anyOk = results.some((r) => r && r.ok);

      if (anyOk || (!config.rsvpScriptUrl && !config.formSubmitEmail)) {
        // If neither backend configured, still show contact fallback below.
        if (anyOk) {
          const msg =
            attending === "yes"
              ? "Thank you! We can't wait to see you! 💙"
              : "Thank you for letting us know. We'll miss you! 💙";
          showStatus(msg, "success");
          form.reset();
          if (guestsLabel) guestsLabel.style.display = "block";
          setTimeout(closeModal, 2500);
          return;
        }
      }

      // Both paths failed (or none configured) — keep guest unstuck with mailto/SMS.
      showStatusHtml(
        `We couldn't confirm automatically. Please ` +
          `<a href="${mailtoFallback(data)}">email your RSVP</a> or ` +
          `<a href="${smsFallback(data)}">text us</a> — thank you!`,
        "error"
      );
    } catch (err) {
      console.error(err);
      showStatusHtml(
        `Something went wrong. Please ` +
          `<a href="${mailtoFallback(data)}">email your RSVP</a> or ` +
          `<a href="${smsFallback(data)}">text Andrew &amp; Lizzie</a>.`,
        "error"
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send RSVP";
    }
  });
})();
