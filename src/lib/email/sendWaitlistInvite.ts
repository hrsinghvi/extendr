import { supabase } from "@/integrations/supabase/client";

/**
 * Send the waitlist launch invite email to one or more recipients.
 * Calls the `send-waitlist-email` Supabase Edge Function which uses Resend.
 *
 * For bulk/CLI sending, use: npx tsx scripts/send-waitlist-email.ts <emails...>
 */
export async function sendWaitlistInvite(to: string | string[]) {
  // Render the React Email component to HTML at build time
  // Import the pre-compiled HTML template
  const htmlModule = await import(
    "../../../email-templates/waitlist-launch-invite.html?raw"
  );
  const html = htmlModule.default;

  const { data, error } = await supabase.functions.invoke(
    "send-waitlist-email",
    {
      body: {
        to: Array.isArray(to) ? to : [to],
        html,
        subject: "You're in — Extendr is live",
      },
    }
  );

  if (error) {
    throw new Error(`Failed to send waitlist invite: ${error.message}`);
  }

  return data;
}
