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
    const subject = `RSVP Response from ${formData.firstName} ${formData.lastName}`;
    
    let emailBody = `
      <h2>New RSVP Response</h2>
      <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Attending:</strong> ${formData.rsvp || ''}</p>
    `;

    if (formData.rsvp === 'Yes') {
      emailBody += `
        <p><strong>Meal Preference:</strong> ${formData.meal || ''}</p>
        <p><strong>Dietary Restrictions:</strong> ${formData.dietary_restrictions || ''}</p>
        <p><strong>Song Request:</strong> ${formData.song || ''}</p>
        <p><strong>Shuttle to McCarthy's:</strong> ${formData.shuttle || ''}</p>
        <p><strong>Sunday Picnic:</strong> ${formData.picnic || ''}</p>
      `;
    }

    const mailOptions = {
      from: import.meta.env.NODEMAILER_USER,
      to: import.meta.env.NODEMAILER_RECIPIENTS || import.meta.env.NODEMAILER_USER,
      subject: subject,
      html: emailBody,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

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