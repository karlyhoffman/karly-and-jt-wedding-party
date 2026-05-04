import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const prerender = false;

function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Invalid content type.' }), { status: 400 });
  }

  try {
    const formData = await request.json() || {};

    // Validate and sanitize inputs
    const firstName = String(formData.firstName || '').trim().slice(0, 100);
    const lastName = String(formData.lastName || '').trim().slice(0, 100);
    const rsvp = formData.rsvp;

    if (!firstName || !lastName) {
      return new Response(JSON.stringify({ error: 'First and last name are required.' }), { status: 400 });
    }

    if (rsvp !== 'Yes' && rsvp !== 'No') {
      return new Response(JSON.stringify({ error: 'Invalid RSVP value.' }), { status: 400 });
    }

    const emailConfirm = String(formData.email_confirm || '').trim().slice(0, 254);
    if (emailConfirm && !isValidEmail(emailConfirm)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: import.meta.env.NODEMAILER_USER,
        pass: import.meta.env.NODEMAILER_PASS,
      },
    });

    const e = escapeHtml;

    // Prepare email content with escaped user input
    let emailBody = `
      <p><strong>Name:</strong> ${e(firstName)} ${e(lastName)}</p>
    `;

    if (rsvp === 'Yes') {
      emailBody += `
        <p><strong>Email:</strong> ${e(emailConfirm)}</p>
        <p><strong>Attending:</strong> Yes</p>
        <p><strong>Meal Preference:</strong> ${e(formData.meal)}</p>
        <p><strong>Dietary Restrictions:</strong> ${e(formData.dietary_restrictions)}</p>
        <p><strong>Song Request:</strong> ${e(formData.song)}</p>
        <p><strong>Shuttle to McCarthy's:</strong> ${e(formData.shuttle)}</p>
        <p><strong>Sunday Picnic:</strong> ${e(formData.picnic)}</p>
        <p><strong>Comments:</strong> ${e(formData.comments)}</p>
      `;
    }

    if (rsvp === 'No') {
      emailBody += `
        <p><strong>Attending:</strong> No</p>
      `;
    }

    const mailOptionsAlert = {
      from: import.meta.env.NODEMAILER_USER,
      to: import.meta.env.NODEMAILER_RECIPIENTS || import.meta.env.NODEMAILER_USER,
      subject: `${rsvp === 'Yes' ? '🎉' : '🚫'} RSVP Response | ${e(firstName)} ${e(lastName)}`,
      html: emailBody,
    };

    // Send email alert
    const emailAlert = await transporter.sendMail(mailOptionsAlert);

    // Send email confirmation
    if (emailConfirm.length) {

      const isAttendingBody = `
        <p>${e(firstName)}, thank you so much for your RSVP. We're thrilled to know that you'll be joining us to celebrate our wedding!</p>
        <p><strong>Here's a quick reminder of the event details:</strong></p>
        <ul>
          <li><strong>Date:</strong> December 6th, 2025</li>
          <li><strong>Time:</strong> 4:00 PM - 10:00 PM</li>
          <li><strong>Location:</strong> The Monday Club, 1815 Monterey St, San Luis Obispo, CA 93401</li>
        </ul>
        <p>If you would like to update your choices, please let us know by replying to this email. Below are the details you provided.</p>
        <br/>
        <hr/>
        <br/>
      ` + emailBody
      + `
        <br/>
        <hr/>
        <br/>
        <p style="margin-bottom: 1.5rem;">We can't wait to celebrate with you!</p>
        <p>With love,</p>
        <p>JT & Karly</p>
      `;

      const isNotAttendingBody = `
        <p>${e(firstName)},</p>
        <p>Thank you so much for letting us know you won't be able to join us for our wedding. While we'll miss celebrating with you in person, we completely understand and are so grateful for your love and support from afar.</p>
        <p>We'll be sure to share photos and memories from the day, and we hope to celebrate together sometime soon!</p>
        <p>With love,</p>
        <p>JT & Karly</p>
      `;

      const html = rsvp === 'Yes' ? isAttendingBody : isNotAttendingBody;

      const mailOptionsConfirm = {
        from: import.meta.env.NODEMAILER_USER,
        to: emailConfirm,
        subject: `Your RSVP has been received! 💌`,
        html,
      };

      const emailConfirmation = await transporter.sendMail(mailOptionsConfirm);      
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "RSVP submitted successfully!",
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error sending RSVP email:", error);
    
    return new Response(
      JSON.stringify({
        error: "Failed to submit RSVP. Please try again later.",
      }),
      { status: 500 }
    );
  }
};