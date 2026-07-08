(function () {
  const config = window.BABY_SHOWER_CONFIG || {};
  const modal = document.getElementById("rsvp-modal");
  const openBtn = document.getElementById("rsvp-open");
  const closeBtn = document.getElementById("rsvp-close");
  const form = document.getElementById("rsvp-form");
  const statusEl = document.getElementById("form-status");
  const guestsLabel = document.getElementById("guests-label");
  const submitBtn = document.getElementById("rsvp-submit");

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
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  form?.querySelectorAll('input[name="attending"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const attending = form.querySelector('input[name="attending"]:checked')?.value;
      guestsLabel.style.display = attending === "yes" ? "block" : "none";
    });
  });

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "form-status " + type;
    statusEl.hidden = false;
  }

  async function submitToAppsScript(data) {
    const url = config.rsvpScriptUrl;
    if (!url) return false;

    const res = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "RSVP failed");
    return true;
  }

  async function submitToFormSubmit(data) {
    const email = config.formSubmitEmail;
    if (!email) return false;

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

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: "POST",
      body,
    });
    const json = await res.json();
    if (!json.success) throw new Error("Could not send RSVP");
    return true;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    statusEl.hidden = true;

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

    try {
      let sent = false;
      if (config.rsvpScriptUrl) {
        sent = await submitToAppsScript(data);
      }
      if (!sent) {
        await submitToFormSubmit(data);
      }

      const msg =
        attending === "yes"
          ? "Thank you! We can't wait to see you! 💙"
          : "Thank you for letting us know. We'll miss you! 💙";
      showStatus(msg, "success");
      form.reset();
      setTimeout(closeModal, 2500);
    } catch (err) {
      showStatus("Something went wrong. Please try again or text Andrew & Lizzie.", "error");
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send RSVP";
    }
  });
})();
