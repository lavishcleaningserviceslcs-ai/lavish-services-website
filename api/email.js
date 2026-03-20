const RESEND_API_URL = "https://api.resend.com/emails";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTemplate(type, payload) {
  if (type === "account_confirmation") {
    const fullName = escapeHtml(payload.fullName || "Customer");
    return {
      subject: "Welcome to Lavish Cleaning Services",
      html:
        "<h2>Welcome, " + fullName + "!</h2>" +
        "<p>Your account has been created successfully.</p>" +
        "<p>You can now manage bookings, payment methods, and profile settings in your customer portal.</p>",
    };
  }

  if (type === "purchase_confirmation") {
    const orderId = escapeHtml(payload.orderId);
    const total = escapeHtml(payload.total);
    const serviceDate = escapeHtml(payload.serviceDate || "Not set");
    return {
      subject: "Booking Confirmation: " + orderId,
      html:
        "<h2>Your booking is confirmed</h2>" +
        "<p><strong>Order:</strong> " + orderId + "</p>" +
        "<p><strong>Service Date:</strong> " + serviceDate + "</p>" +
        "<p><strong>Total:</strong> " + total + "</p>" +
        "<p>Thank you for choosing Lavish Cleaning Services.</p>",
    };
  }

  if (type === "contact_request") {
    const fullName = escapeHtml(payload.fullName || "Unknown");
    const email = escapeHtml(payload.email || "Not provided");
    const phone = escapeHtml(payload.phone || "Not provided");
    const message = escapeHtml(payload.message || "No details provided");
    return {
      subject: "New Quote / Contact Request",
      html:
        "<h2>New incoming lead</h2>" +
        "<p><strong>Name:</strong> " + fullName + "</p>" +
        "<p><strong>Email:</strong> " + email + "</p>" +
        "<p><strong>Phone:</strong> " + phone + "</p>" +
        "<p><strong>Details:</strong><br/>" + message + "</p>",
    };
  }

  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey || !fromEmail || !adminEmail) {
    return json(res, 500, {
      ok: false,
      error: "Missing RESEND_API_KEY, RESEND_FROM_EMAIL, or ADMIN_EMAIL",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const type = body && body.type;
    const payload = (body && body.payload) || {};
    const to = body && body.to ? body.to : null;

    const template = renderTemplate(type, payload);
    if (!template) {
      return json(res, 400, { ok: false, error: "Invalid email type" });
    }

    const recipients = Array.isArray(to) ? to : [to || adminEmail];
    const sendBody = {
      from: fromEmail,
      to: recipients.filter(Boolean),
      subject: template.subject,
      html: template.html,
    };

    const resendRes = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendBody),
    });

    const resendJson = await resendRes.json();
    if (!resendRes.ok) {
      return json(res, 502, { ok: false, error: "Resend send failed", details: resendJson });
    }

    return json(res, 200, { ok: true, id: resendJson && resendJson.id ? resendJson.id : null });
  } catch (err) {
    return json(res, 500, { ok: false, error: "Unexpected error", details: String(err && err.message ? err.message : err) });
  }
};
