import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json() || {};

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: import.meta.env.NODEMAILER_USER,
        pass: import.meta.env.NODEMAILER_PASS,
      },
    });

    // Prepare email content
    let emailBody = `
      <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
    `;

    if (formData.rsvp === 'Yes') {
      emailBody += `
        <p><strong>Email:</strong> ${formData.email_confirm || ''}</p>
        <p><strong>Attending:</strong> ${formData.rsvp || ''}</p>
        <p><strong>Meal Preference:</strong> ${formData.meal || ''}</p>
        <p><strong>Dietary Restrictions:</strong> ${formData.dietary_restrictions || ''}</p>
        <p><strong>Song Request:</strong> ${formData.song || ''}</p>
        <p><strong>Shuttle to McCarthy's:</strong> ${formData.shuttle || ''}</p>
        <p><strong>Sunday Picnic:</strong> ${formData.picnic || ''}</p>
        <p><strong>Comments:</strong> ${formData.comments || ''}</p>
      `;
    }

    if (formData.rsvp === 'No') {
      emailBody += `
        <p><strong>Attending:</strong> ${formData.rsvp || ''}</p>
      `;
    }

    const mailOptionsAlert = {
      from: import.meta.env.NODEMAILER_USER,
      to: import.meta.env.NODEMAILER_RECIPIENTS || import.meta.env.NODEMAILER_USER,
      subject: `${formData.rsvp === 'Yes' ? '🎉' : '🚫'} RSVP Response | ${formData.firstName} ${formData.lastName}`,
      html: emailBody,
    };

    // Send email alert
    const emailAlert = await transporter.sendMail(mailOptionsAlert);

    // Send email confirmation
    if (formData.email_confirm?.length) {

      const isAttendingBody = `
        <p>${formData.firstName}, thank you so much for your RSVP. We're thrilled to know that you'll be joining us to celebrate our wedding!</p>
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
        <p>${formData.firstName},</p>
        <p>Thank you so much for letting us know you won't be able to join us for our wedding. While we'll miss celebrating with you in person, we completely understand and are so grateful for your love and support from afar.</p>
        <p>We'll be sure to share photos and memories from the day, and we hope to celebrate together sometime soon!</p>
        <p>With love,</p>
        <p>JT & Karly</p>
      `;

      const html = formData.rsvp === 'Yes' ? isAttendingBody : isNotAttendingBody;

      const mailOptionsConfirm = {
        from: import.meta.env.NODEMAILER_USER,
        to: formData.email_confirm,
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