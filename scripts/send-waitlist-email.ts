/**
 * Send waitlist launch invite email via Resend + React Email
 *
 * Usage:
 *   npx tsx scripts/send-waitlist-email.ts user@example.com
 *   npx tsx scripts/send-waitlist-email.ts user1@example.com user2@example.com
 *
 * Requires RESEND_API_KEY environment variable (or VITE_RESEND_API_KEY in .env)
 */

import { Resend } from "resend";
import WaitlistLaunchInvite from "../emails/waitlist-launch-invite";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey =
  process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

if (!apiKey) {
  console.error(
    "Error: RESEND_API_KEY or VITE_RESEND_API_KEY must be set in environment or .env"
  );
  process.exit(1);
}

const recipients = process.argv.slice(2);

if (recipients.length === 0) {
  console.error("Usage: npx tsx scripts/send-waitlist-email.ts <email> [email2] ...");
  process.exit(1);
}

const resend = new Resend(apiKey);

async function main() {
  for (const to of recipients) {
    console.log(`Sending waitlist invite to ${to}...`);
    const { data, error } = await resend.emails.send({
      from: "Extendr <hi@extendr.dev>",
      to: [to],
      subject: "You're in — Extendr is live",
      react: WaitlistLaunchInvite(),
    });

    if (error) {
      console.error(`  Failed: ${error.message}`);
    } else {
      console.log(`  Sent! ID: ${data?.id}`);
    }
  }
}

main().catch(console.error);
