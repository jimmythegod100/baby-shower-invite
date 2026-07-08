// Site configuration — update RSVP_SCRIPT_URL after deploying Google Apps Script
window.BABY_SHOWER_CONFIG = {
  eventName: "Andrew & Lizzie's Baby Boy Shower",
  eventDate: "2026-09-20",
  eventTime: "1:00 PM",
  location: "Andrew & Lizzie's House",
  registryUrl:
    "https://www.amazon.com/baby-reg/andrew-martinez-november-2026/11EL4A7RSIA80?ref_=cm_sw_r_cp_ud_dp_7GG9SWDT1XPG0JNMPTVK",

  // Google Apps Script Web App URL (deploy scripts/google-apps-script.gs)
  // Leave empty to use FormSubmit email fallback
  rsvpScriptUrl: "https://script.google.com/macros/s/AKfycbxxMK43eIw6BkHatha0d4D9cZwUIqCZxwVvBLXxrX9uvC2_jFhwtvpEZeSu5Wjm4WY3/exec",

  // FormSubmit fallback — RSVPs emailed to this address
  formSubmitEmail: "andrewjamesmartinez91@gmail.com",

  // Admin page password (must match ADMIN_PASSWORD in Apps Script)
  adminPassword: "babyblue2026",
};
