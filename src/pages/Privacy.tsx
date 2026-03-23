/**
 * Privacy Policy Page
 *
 * Comprehensive privacy policy for the extendr platform.
 * Covers data collection, usage, storage, sharing, and user rights.
 */
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";

export default function Privacy() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />

        <main className="px-4 pt-20 min-h-screen max-w-4xl mx-auto relative">
          <div className="text-left mb-8 pt-8">
            <h1 className="text-4xl font-bold leading-[130%] text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-sm">
              Last Updated: March 22, 2026
            </p>
          </div>

          <div className="space-y-12 pb-24">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Introduction
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  extendr ("Company," "we," "us," or "our") is committed to protecting the
                  privacy and security of your personal information. This Privacy Policy
                  describes how we collect, use, store, share, and protect information about
                  you when you access or use our platform, website, application, APIs, or any
                  associated services (collectively, the "Service"). By accessing or using the
                  Service, you acknowledge that you have read, understood, and consent to the
                  practices described in this Privacy Policy. If you do not agree with any
                  part of this Privacy Policy, you must immediately stop using the Service.
                </p>
                <p>
                  This Privacy Policy applies to all users of the Service, including
                  visitors, registered users, and subscribers. It covers information collected
                  online through the Service and does not apply to information collected
                  offline or through other means. We reserve the right to modify this Privacy
                  Policy at any time, and your continued use of the Service after such
                  modifications constitutes acceptance of the updated Privacy Policy.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  We collect several categories of information in connection with your use of
                  the Service:
                </p>
                <h3 className="text-lg font-medium text-white mt-6">
                  2.1. Information You Provide Directly
                </h3>
                <p>
                  When you create an account, subscribe to a plan, or otherwise interact with
                  the Service, you may provide us with personal information including but not
                  limited to: your name, email address, password or authentication
                  credentials, billing and payment information (processed through our
                  third-party payment processor, Stripe), and any other information you
                  voluntarily submit through the Service, including chat messages, prompts,
                  and project data.
                </p>
                <h3 className="text-lg font-medium text-white mt-6">
                  2.2. Information Collected Automatically
                </h3>
                <p>
                  When you access or use the Service, we automatically collect certain
                  information, including: your IP address, browser type and version, operating
                  system, device identifiers, referring URLs, pages visited and interactions
                  within the Service, timestamps and duration of visits, click patterns and
                  navigation paths, and technical information about your device and connection.
                </p>
                <h3 className="text-lg font-medium text-white mt-6">
                  2.3. Information from Third Parties
                </h3>
                <p>
                  We may receive information about you from third-party services, including
                  authentication providers (such as Google or GitHub if used for sign-in),
                  payment processors (Stripe), analytics providers, and other third-party
                  integrations that you authorize or that we use to operate the Service.
                </p>
                <h3 className="text-lg font-medium text-white mt-6">
                  2.4. AI-Generated Content and Usage Data
                </h3>
                <p>
                  When you use our AI-powered features, we collect and process the prompts,
                  messages, and instructions you submit to the AI system, as well as the
                  AI-generated responses, code, and extension files produced. This data is
                  necessary to provide the Service and may be used to improve our AI models
                  and service quality, subject to the limitations described in this Privacy
                  Policy.
                </p>
              </div>
            </section>

            {/* 3. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  We use the information we collect for the following purposes: to provide,
                  maintain, and improve the Service; to process transactions and manage your
                  subscription; to authenticate your identity and manage your account; to
                  communicate with you about the Service, including service announcements,
                  updates, security alerts, and administrative messages; to respond to your
                  inquiries and provide customer support; to monitor and analyze usage trends,
                  patterns, and activities in connection with the Service; to detect, prevent,
                  and address technical issues, fraud, abuse, or illegal activity; to enforce
                  our Terms and Conditions and other policies; to comply with legal
                  obligations and respond to lawful requests from public authorities; and for
                  any other purpose with your consent.
                </p>
                <p>
                  We do not sell your personal information to third parties. We do not use
                  your personal information for targeted advertising from third-party
                  advertisers. We may use aggregated, anonymized, or de-identified data for
                  any purpose, including analytics, research, and service improvement, as such
                  data does not constitute personal information.
                </p>
              </div>
            </section>

            {/* 4. Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Data Storage and Security
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  We store your information using industry-standard cloud infrastructure
                  providers, including Supabase and other reputable service providers. Your
                  data may be stored and processed in the United States or in other countries
                  where our service providers maintain facilities. By using the Service, you
                  consent to the transfer of your information to these locations.
                </p>
                <p>
                  We implement commercially reasonable technical and organizational measures
                  designed to protect your personal information against unauthorized access,
                  alteration, disclosure, or destruction. These measures include but are not
                  limited to encryption of data in transit and at rest, access controls and
                  authentication mechanisms, regular security assessments, and monitoring for
                  suspicious activity. However, no method of transmission over the Internet or
                  method of electronic storage is 100% secure. While we strive to protect your
                  personal information, we cannot guarantee its absolute security, and you
                  acknowledge and accept this inherent risk.
                </p>
                <p>
                  IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY UNAUTHORIZED ACCESS TO,
                  ALTERATION OF, OR THE DELETION, DESTRUCTION, DAMAGE, LOSS, OR FAILURE TO
                  STORE ANY OF YOUR DATA OR OTHER CONTENT, WHETHER OR NOT SUCH BREACH RESULTS
                  FROM THE COMPANY'S NEGLIGENCE. YOU ARE SOLELY RESPONSIBLE FOR MAINTAINING
                  THE CONFIDENTIALITY OF YOUR ACCOUNT CREDENTIALS AND FOR ANY ACTIVITY THAT
                  OCCURS UNDER YOUR ACCOUNT.
                </p>
              </div>
            </section>

            {/* 5. Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Data Sharing and Disclosure
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  We may share your information in the following circumstances:
                </p>
                <p>
                  <strong className="text-white">Service Providers:</strong> We share
                  information with third-party service providers who perform services on our
                  behalf, including payment processing (Stripe), cloud hosting and
                  infrastructure (Supabase, Vercel), AI model providers (OpenRouter, OpenAI,
                  Google, Anthropic, DeepSeek, Hugging Face, and others), analytics providers,
                  and email service providers. These providers are contractually obligated to
                  use your information only as necessary to provide services to us and in
                  accordance with applicable data protection laws.
                </p>
                <p>
                  <strong className="text-white">AI Model Providers:</strong> When you use
                  the AI features of the Service, your prompts and messages are transmitted to
                  third-party AI model providers for processing. These providers may have their
                  own privacy policies and data handling practices. We encourage you to review
                  the privacy policies of any AI providers whose models you choose to use
                  through the Service. We are not responsible for the privacy practices of
                  third-party AI providers.
                </p>
                <p>
                  <strong className="text-white">Legal Requirements:</strong> We may disclose
                  your information if required to do so by law, regulation, legal process, or
                  governmental request, or when we believe in good faith that disclosure is
                  necessary to protect our rights, protect your safety or the safety of others,
                  investigate fraud, or respond to a government request.
                </p>
                <p>
                  <strong className="text-white">Business Transfers:</strong> In the event of
                  a merger, acquisition, reorganization, bankruptcy, or other similar event,
                  your information may be transferred to the successor entity. We will notify
                  you of any such change in ownership or control of your personal information.
                </p>
                <p>
                  <strong className="text-white">With Your Consent:</strong> We may share
                  your information with third parties when you have given us explicit consent
                  to do so.
                </p>
              </div>
            </section>

            {/* 6. Cookies and Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  We use cookies, local storage, and similar tracking technologies to collect
                  and store information about your use of the Service. Cookies are small data
                  files stored on your device that help us improve the Service and your
                  experience. We use the following types of cookies and similar technologies:
                </p>
                <p>
                  <strong className="text-white">Essential Cookies:</strong> These are
                  necessary for the Service to function and cannot be disabled. They include
                  authentication tokens, session identifiers, and security-related cookies.
                </p>
                <p>
                  <strong className="text-white">Functional Cookies:</strong> These enable
                  personalized features such as remembering your preferences, selected AI
                  model configurations, and other settings stored in localStorage.
                </p>
                <p>
                  <strong className="text-white">Analytics Cookies:</strong> These help us
                  understand how you interact with the Service, which pages you visit, and how
                  you navigate the platform. This information is used to improve the Service.
                </p>
                <p>
                  You can control cookie settings through your browser preferences. However,
                  disabling certain cookies may limit your ability to use some features of the
                  Service. By continuing to use the Service, you consent to our use of cookies
                  and similar technologies as described in this Privacy Policy.
                </p>
              </div>
            </section>

            {/* 7. Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. Data Retention
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  We retain your personal information for as long as your account is active or
                  as needed to provide you with the Service. We may also retain your
                  information as necessary to comply with our legal obligations, resolve
                  disputes, enforce our agreements, and for legitimate business purposes. When
                  your information is no longer needed for these purposes, we will delete or
                  anonymize it in accordance with our data retention policies.
                </p>
                <p>
                  Project data, including AI-generated extension files, chat histories, and
                  associated content, will be retained for the duration of your active account
                  and for a reasonable period after account deletion to allow for recovery in
                  case of accidental deletion. After this period, project data will be
                  permanently deleted.
                </p>
                <p>
                  Aggregated, anonymized, or de-identified data may be retained indefinitely
                  for analytics, research, and service improvement purposes.
                </p>
              </div>
            </section>

            {/* 8. Your Rights and Choices */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Your Rights and Choices
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Depending on your jurisdiction, you may have certain rights regarding your
                  personal information, including:
                </p>
                <p>
                  <strong className="text-white">Access:</strong> You have the right to
                  request access to the personal information we hold about you.
                </p>
                <p>
                  <strong className="text-white">Correction:</strong> You have the right to
                  request correction of inaccurate or incomplete personal information.
                </p>
                <p>
                  <strong className="text-white">Deletion:</strong> You have the right to
                  request deletion of your personal information, subject to certain
                  exceptions. Please note that deleting your account will result in the
                  permanent loss of all your projects, chat histories, and associated data.
                  This action cannot be undone.
                </p>
                <p>
                  <strong className="text-white">Data Portability:</strong> You have the
                  right to request a copy of your personal information in a structured,
                  commonly used, and machine-readable format.
                </p>
                <p>
                  <strong className="text-white">Objection:</strong> You have the right to
                  object to certain processing of your personal information, such as
                  processing for direct marketing purposes.
                </p>
                <p>
                  <strong className="text-white">Withdrawal of Consent:</strong> Where
                  processing is based on your consent, you have the right to withdraw that
                  consent at any time, without affecting the lawfulness of processing based on
                  consent before its withdrawal.
                </p>
                <p>
                  To exercise any of these rights, please contact us at hi@extendr.dev. We
                  will respond to your request within a reasonable timeframe and in accordance
                  with applicable law. We may require you to verify your identity before
                  processing your request.
                </p>
              </div>
            </section>

            {/* 9. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                9. Children's Privacy
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  The Service is not directed to children under the age of 13 (or the
                  applicable age of digital consent in your jurisdiction). We do not knowingly
                  collect personal information from children under this age. If we become
                  aware that we have inadvertently collected personal information from a child
                  under the applicable age, we will take steps to delete such information as
                  soon as possible. If you believe that a child under the applicable age has
                  provided us with personal information, please contact us at hi@extendr.dev.
                </p>
              </div>
            </section>

            {/* 10. International Data Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                10. International Data Transfers
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Your information may be transferred to, stored, and processed in countries
                  other than the country in which you reside. These countries may have data
                  protection laws that are different from the laws of your country. By using
                  the Service, you consent to the transfer of your information to countries
                  outside of your country of residence, including the United States, where
                  data protection laws may differ. We take steps to ensure that your
                  information receives an adequate level of protection in the jurisdictions in
                  which we process it.
                </p>
              </div>
            </section>

            {/* 11. California Privacy Rights (CCPA) */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                11. California Privacy Rights (CCPA)
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  If you are a California resident, you have additional rights under the
                  California Consumer Privacy Act (CCPA), including the right to know what
                  personal information we collect, use, disclose, and sell; the right to
                  request deletion of your personal information; the right to opt-out of the
                  sale of your personal information (we do not sell personal information); and
                  the right to non-discrimination for exercising your CCPA rights. To exercise
                  your CCPA rights, please contact us at hi@extendr.dev.
                </p>
              </div>
            </section>

            {/* 12. European Privacy Rights (GDPR) */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                12. European Privacy Rights (GDPR)
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  If you are located in the European Economic Area (EEA), the United Kingdom,
                  or Switzerland, you have additional rights under the General Data Protection
                  Regulation (GDPR) and equivalent legislation. Our legal bases for processing
                  your personal data include: performance of a contract (providing the
                  Service), legitimate interests (improving the Service, fraud prevention),
                  compliance with legal obligations, and your consent. You have the right to
                  lodge a complaint with your local data protection supervisory authority if
                  you believe we have not adequately addressed your concerns. To exercise your
                  GDPR rights, please contact us at hi@extendr.dev.
                </p>
              </div>
            </section>

            {/* 13. Third-Party Links and Services */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                13. Third-Party Links and Services
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  The Service may contain links to third-party websites, services, or
                  applications that are not operated by us. We are not responsible for the
                  privacy practices of these third parties. We encourage you to review the
                  privacy policies of any third-party services you access through the Service.
                  This Privacy Policy applies only to information collected through our
                  Service and does not apply to any third-party website or service linked to or
                  from the Service.
                </p>
              </div>
            </section>

            {/* 14. Changes to This Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                14. Changes to This Privacy Policy
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  We reserve the right to update or modify this Privacy Policy at any time
                  and without prior notice. When we make changes, we will update the "Last
                  Updated" date at the top of this Privacy Policy. Your continued use of the
                  Service after any changes to this Privacy Policy constitutes your acceptance
                  of such changes. We encourage you to review this Privacy Policy periodically
                  to stay informed about how we are protecting your information. Material
                  changes to this Privacy Policy may be communicated to you through the
                  Service or via email, at our discretion.
                </p>
              </div>
            </section>

            {/* 15. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                15. Limitation of Liability
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY SHALL NOT BE
                  LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                  DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE
                  LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS
                  OR USE THE SERVICE; (B) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS
                  AND/OR ANY PERSONAL INFORMATION STORED THEREIN; (C) ANY INTERRUPTION OR
                  CESSATION OF TRANSMISSION TO OR FROM THE SERVICE; (D) ANY BUGS, VIRUSES,
                  TROJAN HORSES, OR THE LIKE THAT MAY BE TRANSMITTED TO OR THROUGH THE
                  SERVICE BY ANY THIRD PARTY; OR (E) ANY ERRORS OR OMISSIONS IN ANY CONTENT
                  OR FOR ANY LOSS OR DAMAGE INCURRED AS A RESULT OF THE USE OF ANY CONTENT
                  POSTED, EMAILED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE THROUGH THE
                  SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL
                  THEORY, AND WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH
                  DAMAGE.
                </p>
              </div>
            </section>

            {/* 16. Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                16. Contact Us
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy
                  Policy or our data practices, please contact us at:
                </p>
                <p>
                  <strong className="text-white">Email:</strong>{" "}
                  <a
                    href="mailto:hi@extendr.dev"
                    className="text-primary hover:underline"
                  >
                    hi@extendr.dev
                  </a>
                </p>
                <p>
                  We will make every effort to respond to your inquiry in a timely manner. If
                  you are not satisfied with our response, you may have the right to lodge a
                  complaint with your local data protection authority.
                </p>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
