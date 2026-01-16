"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
};

export async function sendEmail(prevState: ContactState, formData: FormData): Promise<ContactState> {
  // Validate fields
  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      error: "Missing Fields. Failed to send message.",
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  try {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("Missing RESEND_API_KEY");
    }

    const { data, error } = await resend.emails.send({
      from: `Portfolio Contact <onboarding@resend.dev>`, // Use default verified domain for testing, or user's domain
      to: ["huangqiannb@gmail.com"],
      subject: `[Portfolio] ${subject}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: "Failed to send email. Please try again later." };
    }

    return { success: true };
  } catch (error) {
    console.error("Server Error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
