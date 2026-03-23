/**
 * Terms and Conditions Page
 *
 * Comprehensive legal terms of service for the extendr platform.
 * Covers all aspects of service usage, liability limitations,
 * payment terms, and user responsibilities.
 */
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";

export default function Terms() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />

        <main className="px-4 pt-24 sm:pt-32 lg:pt-44 min-h-screen max-w-4xl mx-auto relative">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 sm:p-12 mb-12">
          <div className="text-left mb-8">
            <h1 className="text-4xl font-bold leading-[130%] text-white mb-4">
              Terms and Conditions
            </h1>
            <p className="text-gray-400 text-sm">
              Last Updated: March 22, 2026
            </p>
          </div>

          <div className="space-y-12 pb-24">
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  By accessing, browsing, or using the extendr platform, website, application,
                  application programming interfaces (APIs), or any associated services
                  (collectively referred to as the "Service"), you acknowledge that you have
                  read, understood, and agree to be legally bound by these Terms and Conditions
                  (the "Terms"), as well as our Privacy Policy, which is incorporated herein by
                  reference. These Terms constitute a legally binding agreement between you
                  ("User," "you," or "your") and extendr ("Company," "we," "us," or "our").
                  If you do not agree to these Terms in their entirety, you must immediately
                  cease all use of the Service and discontinue any access to the platform.
                </p>
                <p>
                  Your continued use of the Service following any modifications, updates, or
                  amendments to these Terms shall constitute your acceptance of such changes.
                  It is your sole responsibility to review these Terms periodically to stay
                  informed of any updates. We reserve the right, at our sole and absolute
                  discretion, to modify, amend, supplement, or replace any part of these Terms
                  at any time and without prior notice to you. Any such modifications shall
                  become effective immediately upon posting to the Service. Your failure to
                  review these Terms does not relieve you of your obligation to comply with
                  them.
                </p>
                <p>
                  By creating an account, subscribing to any plan, purchasing credits, or
                  otherwise engaging with the Service in any capacity, you represent and warrant
                  that you have the legal capacity and authority to enter into these Terms. If
                  you are accessing or using the Service on behalf of a business, organization,
                  or other legal entity, you represent and warrant that you have the authority
                  to bind that entity to these Terms, and in such case, "you" and "your" shall
                  refer to that entity. If you do not have such authority, or if you do not
                  agree with these Terms, you must not accept these Terms and must not use the
                  Service.
                </p>
                <p>
                  These Terms apply to all visitors, users, subscribers, and others who access
                  or use the Service, regardless of the device, browser, or method used to
                  access the Service. You acknowledge that these Terms supersede any prior
                  agreements, communications, or representations, whether written or oral,
                  between you and extendr regarding the subject matter herein. Any additional
                  terms, conditions, or agreements that you may propose are hereby rejected and
                  shall have no force or effect unless explicitly agreed to in writing by an
                  authorized representative of extendr.
                </p>
              </div>
            </section>

            {/* 2. Description of Service */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Description of Service
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  extendr is an artificial intelligence-powered software-as-a-service (SaaS)
                  platform designed to assist users in building Google Chrome browser extensions
                  compliant with Manifest V3 specifications. The Service provides users with an
                  interactive, chat-based interface through which they can communicate with AI
                  models to generate, modify, and manage extension source code, manifest files,
                  icons, popup interfaces, background scripts, content scripts, and other files
                  necessary for a functioning Chrome extension.
                </p>
                <p>
                  The Service utilizes multiple third-party AI model providers, including but
                  not limited to OpenRouter, Google Gemini, OpenAI, Anthropic Claude, and
                  DeepSeek, to process user prompts and generate code, assets, and configurations.
                  The Service includes a suite of specialized tools that the AI can invoke to
                  create files, update manifests, generate icons, set up popup HTML, configure
                  background and content scripts, manage permissions, create options pages, and
                  perform other extension-building tasks within a sandboxed WebContainer
                  environment.
                </p>
                <p>
                  The Service also includes a live preview feature that allows users to view
                  and test their extensions in a simulated environment before downloading and
                  deploying them. Users may download their completed extension files as a
                  packaged archive for manual loading into the Chrome browser or for submission
                  to the Chrome Web Store. The Service may also provide project management
                  features, including the ability to save, load, and manage multiple extension
                  projects associated with a user's account.
                </p>
                <p>
                  The features, functionality, and availability of the Service may change at
                  any time without prior notice. We reserve the right to add, modify, suspend,
                  or discontinue any feature, tool, AI model, or aspect of the Service at our
                  sole discretion. We do not guarantee that any specific feature, AI model, or
                  tool will remain available, and we shall not be liable for any modification,
                  suspension, or discontinuation of any part of the Service. The Service is
                  provided on an "as-is" and "as-available" basis, and your use of the Service
                  is at your own risk.
                </p>
                <p>
                  extendr does not guarantee that the AI-generated output will be accurate,
                  complete, functional, secure, free of errors, free of vulnerabilities, or
                  suitable for any particular purpose. The AI models are statistical language
                  models that generate output based on patterns in training data and user input,
                  and such output may contain errors, inaccuracies, security vulnerabilities,
                  deprecated code patterns, or incompatible configurations. Users are solely
                  responsible for reviewing, testing, debugging, and validating all AI-generated
                  content before use.
                </p>
              </div>
            </section>

            {/* 3. Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. Eligibility
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  To use the Service, you must be at least eighteen (18) years of age or the
                  age of legal majority in your jurisdiction, whichever is greater. By using the
                  Service, you represent and warrant that you meet this age requirement. If you
                  are under the applicable age of majority, you may not use the Service under
                  any circumstances, and any use of the Service by a minor is strictly
                  prohibited and constitutes a violation of these Terms.
                </p>
                <p>
                  You must be a natural person or a duly authorized representative of a legal
                  entity that is validly existing and in good standing under the laws of its
                  jurisdiction of formation. You represent and warrant that you have not been
                  previously banned, suspended, or otherwise prohibited from using the Service.
                  You further represent and warrant that your use of the Service does not
                  violate any applicable law, regulation, or obligation to any third party,
                  including but not limited to export control laws, sanctions, embargoes, or
                  other restrictions imposed by governmental authorities.
                </p>
                <p>
                  We reserve the right, at our sole discretion, to refuse access to the Service
                  to any person or entity, for any reason or no reason at all, at any time and
                  without prior notice. We may require additional verification of your identity,
                  eligibility, or authority at any time, and failure to provide such
                  verification upon request may result in immediate suspension or termination
                  of your account and access to the Service. We are under no obligation to
                  provide reasons for any refusal, suspension, or termination of access.
                </p>
                <p>
                  Users located in jurisdictions where the use of AI-generated content, browser
                  extensions, or SaaS platforms is restricted or prohibited by law are solely
                  responsible for ensuring their compliance with all applicable local, state,
                  national, and international laws and regulations. extendr makes no
                  representation that the Service is appropriate or available for use in any
                  particular jurisdiction, and accessing the Service from jurisdictions where
                  its content or use is illegal or restricted is prohibited.
                </p>
              </div>
            </section>

            {/* 4. Account Registration and Security */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Account Registration and Security
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  In order to access certain features of the Service, you must create an
                  account by providing accurate, current, and complete information during the
                  registration process. You agree to maintain and promptly update your account
                  information to keep it accurate, current, and complete at all times. Providing
                  false, inaccurate, outdated, or incomplete information constitutes a breach
                  of these Terms and may result in the immediate termination of your account
                  without notice or refund.
                </p>
                <p>
                  You are solely responsible for maintaining the confidentiality and security
                  of your account credentials, including your username, password, and any
                  associated authentication tokens. You agree to immediately notify extendr of
                  any unauthorized use of your account or any other breach of security of which
                  you become aware. extendr shall not be liable for any loss, damage, or
                  liability arising from your failure to maintain the security of your account
                  credentials or from any unauthorized access to your account, regardless of
                  whether such access was caused by your negligence or the actions of a third
                  party.
                </p>
                <p>
                  You agree that you will not share, transfer, sell, or otherwise provide
                  access to your account to any other person or entity. Each account is
                  personal to the individual or entity that created it, and you may not permit
                  any other person to use your account to access the Service. Any actions taken
                  through your account shall be deemed to have been taken by you, and you shall
                  be fully responsible for all activities that occur under your account,
                  including but not limited to all charges, content generated, extensions
                  created, and communications made through the Service.
                </p>
                <p>
                  We reserve the right to disable, suspend, or terminate any account at any
                  time, for any reason, including but not limited to suspected unauthorized
                  access, violation of these Terms, suspected fraudulent activity, or
                  inactivity. In the event of account termination, you may lose access to all
                  data, projects, extensions, and other content associated with your account.
                  extendr is under no obligation to retain, backup, or provide copies of any
                  data or content associated with a terminated account, and you acknowledge
                  that extendr shall not be liable for any loss of data or content resulting
                  from account termination.
                </p>
                <p>
                  You acknowledge that the Service utilizes third-party authentication and
                  identity management services, including but not limited to Supabase
                  authentication. extendr is not responsible for any failures, errors, outages,
                  or security breaches in such third-party authentication services, and you
                  agree to hold extendr harmless from any claims, damages, or losses arising
                  from such third-party service issues.
                </p>
              </div>
            </section>

            {/* 5. Subscription Plans and Payments */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Subscription Plans and Payments
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  The Service offers various subscription plans, including free and paid tiers,
                  each with different features, credit allocations, and limitations. The
                  specific features, pricing, credit amounts, and terms of each subscription
                  plan are described on the Service's pricing page and may be modified at any
                  time at our sole discretion. By subscribing to a paid plan, you agree to pay
                  all applicable fees as described at the time of your subscription, including
                  any applicable taxes, surcharges, or additional charges.
                </p>
                <p>
                  <span className="text-white font-semibold uppercase">
                    All payments are final and non-refundable. There are no refunds under any
                    circumstances.
                  </span>{" "}
                  This includes, but is not limited to, situations where you are dissatisfied
                  with the Service, where the Service does not meet your expectations, where
                  you do not use all of your allocated credits, where you cancel your
                  subscription before the end of a billing cycle, where the Service experiences
                  downtime or outages, where AI-generated content does not function as intended,
                  where your extension is rejected by the Chrome Web Store, or where you
                  experience any other issue, inconvenience, or dissatisfaction with the
                  Service. By subscribing to any paid plan, you expressly acknowledge and agree
                  that you have no right to any refund, credit, pro-rata adjustment, or other
                  form of monetary compensation for any reason whatsoever.
                </p>
                <p>
                  Paid subscriptions are billed on a recurring basis according to the billing
                  cycle associated with your selected plan (monthly or annually). Your
                  subscription will automatically renew at the end of each billing cycle unless
                  you cancel your subscription before the renewal date. By subscribing, you
                  authorize extendr and its third-party payment processor, Stripe, to
                  automatically charge your designated payment method at the beginning of each
                  renewal period. It is your responsibility to ensure that your payment
                  information is accurate and that sufficient funds are available for each
                  renewal charge.
                </p>
                <p>
                  We reserve the right to change the pricing of any subscription plan at any
                  time. Price changes for existing subscribers will take effect at the beginning
                  of the next billing cycle following notice of the price change. Notice may be
                  provided via email, in-app notification, or posting on the Service. Your
                  continued use of the Service after a price change constitutes your acceptance
                  of the new pricing. If you do not agree with a price change, your sole remedy
                  is to cancel your subscription before the new pricing takes effect; however,
                  no refund will be issued for any remaining time on your current billing cycle.
                </p>
                <p>
                  If a payment fails, is declined, or is reversed for any reason, we reserve
                  the right to immediately suspend or terminate your access to paid features of
                  the Service. We may also attempt to charge your payment method again at a
                  later time. You are responsible for any fees, charges, or penalties imposed by
                  your bank, credit card issuer, or payment provider in connection with failed
                  or reversed payments. Promotional pricing, discounts, coupon codes, or
                  promotional credits are subject to additional terms and conditions and may be
                  revoked, modified, or discontinued at any time without notice.
                </p>
                <p>
                  You acknowledge and agree that extendr uses Stripe as its third-party payment
                  processor. Your payment information is transmitted directly to Stripe and is
                  subject to Stripe's terms of service and privacy policy. extendr does not
                  store your full credit card number, CVV, or other sensitive payment card
                  information on its servers. extendr is not responsible for any errors,
                  failures, security breaches, unauthorized charges, or other issues arising
                  from Stripe's payment processing services.
                </p>
              </div>
            </section>

            {/* 6. Credits and Usage */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Credits and Usage
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  The Service operates on a credit-based system in which each message sent to
                  the AI assistant consumes one (1) credit. Credits are allocated to your
                  account based on your subscription plan at the beginning of each billing
                  cycle. The number of credits included with each plan is specified on the
                  pricing page and is subject to change at any time at our sole discretion.
                  Each credit represents a single interaction with the AI system, regardless of
                  the length, complexity, or outcome of the interaction.
                </p>
                <p>
                  <span className="text-white font-semibold">
                    Credits do not roll over from one billing cycle to the next.
                  </span>{" "}
                  Any unused credits at the end of a billing cycle will expire and be forfeited
                  without compensation, refund, or credit. Credits have no monetary value and
                  cannot be exchanged, transferred, sold, or redeemed for cash or any other
                  form of consideration. Credits are non-transferable between accounts and
                  cannot be gifted, assigned, or otherwise conveyed to any other user or
                  entity.
                </p>
                <p>
                  We do not guarantee the availability of credits at any particular time. There
                  may be periods during which the Service is unable to process messages or
                  deduct credits due to system maintenance, outages, high demand, or other
                  technical issues. In such cases, you acknowledge that extendr shall not be
                  liable for any inability to use your credits, any expiration of credits
                  during periods of service unavailability, or any other loss or inconvenience
                  arising from the credit system.
                </p>
                <p>
                  We reserve the right to modify the credit system at any time, including but
                  not limited to changing the number of credits required per interaction,
                  changing the number of credits allocated per plan, implementing different
                  credit costs for different types of interactions or AI models, or replacing
                  the credit system entirely with a different usage measurement system. Any
                  such changes may be made without prior notice and shall take effect
                  immediately upon implementation.
                </p>
                <p>
                  Abuse of the credit system, including but not limited to creating multiple
                  accounts to obtain additional free credits, using automated tools to send
                  messages, exploiting bugs or vulnerabilities to obtain unauthorized credits,
                  or any other form of credit manipulation, is strictly prohibited and may
                  result in immediate termination of your account, forfeiture of all remaining
                  credits, and potential legal action.
                </p>
              </div>
            </section>

            {/* 7. AI-Generated Content and Extensions */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. AI-Generated Content and Extensions
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  The Service utilizes artificial intelligence models to generate source code,
                  configuration files, manifest files, HTML, CSS, JavaScript, TypeScript, icon
                  assets, and other content (collectively, "AI-Generated Content") in response
                  to user prompts and instructions. You acknowledge and agree that AI-Generated
                  Content is produced by statistical language models and machine learning
                  algorithms that generate output based on patterns in their training data and
                  the specific input provided by the user.
                </p>
                <p>
                  <span className="text-white font-semibold">
                    extendr provides absolutely no warranty, guarantee, or assurance of any kind
                    regarding the accuracy, completeness, functionality, security, reliability,
                    or fitness for any particular purpose of any AI-Generated Content.
                  </span>{" "}
                  AI-Generated Content may contain errors, bugs, security vulnerabilities,
                  deprecated APIs, incompatible code patterns, logic flaws, performance issues,
                  memory leaks, cross-site scripting vulnerabilities, data exposure risks, or
                  other defects. The AI models may hallucinate nonexistent APIs, generate code
                  that references libraries or functions that do not exist, produce code that
                  violates Chrome Web Store policies, or create extensions that behave
                  unexpectedly or maliciously.
                </p>
                <p>
                  You are solely and entirely responsible for reviewing, testing, debugging,
                  validating, and auditing all AI-Generated Content before using, deploying,
                  distributing, or publishing it in any manner. You acknowledge that you use
                  AI-Generated Content at your own risk and that extendr shall not be liable
                  for any damages, losses, claims, or liabilities arising from your use of
                  AI-Generated Content, including but not limited to damages caused by bugs,
                  security vulnerabilities, data breaches, privacy violations, intellectual
                  property infringement, or any other issue in the AI-Generated Content.
                </p>
                <p>
                  <span className="text-white font-semibold">
                    extendr does not guarantee that any extension built using the Service will
                    be approved by, accepted by, or compliant with the policies of the Chrome
                    Web Store, Google, or any other distribution platform.
                  </span>{" "}
                  Chrome Web Store review processes, policies, and requirements are controlled
                  entirely by Google and are subject to change without notice. extendr has no
                  control over and no responsibility for Chrome Web Store approval decisions.
                  If your extension is rejected, removed, or suspended from the Chrome Web
                  Store or any other platform, extendr shall not be liable, and no refund,
                  credit, or compensation of any kind shall be provided.
                </p>
                <p>
                  extendr is not liable for any bugs, crashes, security issues, data loss,
                  privacy breaches, performance problems, compatibility issues, or other
                  defects in extensions built using the Service. You acknowledge that browser
                  extensions operate with significant access to user data, browsing activity,
                  and system resources, and that poorly designed or buggy extensions can cause
                  serious harm to end users. You accept full responsibility for ensuring that
                  any extensions you build, distribute, or publish using the Service are safe,
                  secure, functional, and compliant with all applicable laws and platform
                  policies.
                </p>
                <p>
                  You further acknowledge that AI-Generated Content may inadvertently include
                  code, patterns, or structures that are similar to or derived from
                  open-source projects, proprietary codebases, or other third-party works. It
                  is your sole responsibility to review AI-Generated Content for potential
                  intellectual property issues and to ensure compliance with all applicable
                  licenses, copyrights, trademarks, and other intellectual property rights.
                  extendr disclaims all liability for any intellectual property infringement
                  claims arising from AI-Generated Content.
                </p>
              </div>
            </section>

            {/* 8. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Intellectual Property
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Subject to these Terms, you retain ownership of the extensions, source code,
                  and other original content that you create using the Service, to the extent
                  that such content constitutes original work of authorship. However, your
                  ownership is subject to the rights of third parties, including but not limited
                  to the rights of AI model providers, open-source license holders, and other
                  third parties whose intellectual property may be incorporated into
                  AI-Generated Content. You are solely responsible for determining and ensuring
                  that you have the right to use, distribute, and commercialize any content
                  created using the Service.
                </p>
                <p>
                  The extendr platform, including but not limited to its software, source code,
                  algorithms, user interface designs, graphics, logos, trademarks, service
                  marks, trade dress, domain names, documentation, and all other intellectual
                  property associated with the Service (collectively, "extendr IP"), is and
                  shall remain the exclusive property of extendr and its licensors. Nothing in
                  these Terms grants you any right, title, or interest in or to the extendr IP,
                  except for the limited, non-exclusive, non-transferable, revocable license
                  to use the Service as expressly permitted by these Terms.
                </p>
                <p>
                  You are granted a limited, non-exclusive, non-transferable, revocable license
                  to access and use the Service solely for the purpose of building Chrome
                  extensions for your own personal or business use, subject to these Terms. This
                  license does not include the right to sublicense, resell, redistribute,
                  reverse engineer, decompile, disassemble, or create derivative works of the
                  Service or any component thereof. You may not copy, reproduce, modify, adapt,
                  translate, or create derivative works of any part of the Service, including
                  its user interface, design, or functionality.
                </p>
                <p>
                  By using the Service, you grant extendr a non-exclusive, worldwide,
                  royalty-free, perpetual, irrevocable license to use, reproduce, modify,
                  adapt, publish, and display any content you submit to the Service (including
                  prompts, project names, and configurations) for the purpose of providing,
                  improving, and promoting the Service. This license includes the right to use
                  anonymized and aggregated data derived from your use of the Service for
                  analytics, research, product development, and marketing purposes. You
                  represent and warrant that you have the right to grant this license for all
                  content you submit to the Service.
                </p>
                <p>
                  Any feedback, suggestions, ideas, feature requests, bug reports, or other
                  communications you provide to extendr regarding the Service ("Feedback")
                  shall become the exclusive property of extendr. You hereby assign to extendr
                  all right, title, and interest in and to any Feedback, and extendr shall be
                  free to use, implement, modify, commercialize, and incorporate such Feedback
                  into the Service or any other product or service without any obligation,
                  compensation, or attribution to you.
                </p>
              </div>
            </section>

            {/* 9. User Conduct and Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                9. User Conduct and Acceptable Use
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  You agree to use the Service only for lawful purposes and in accordance with
                  these Terms. You are solely responsible for all content you create, generate,
                  upload, or distribute using the Service, and for all activities that occur
                  under your account. You agree that you will not use the Service to create,
                  build, generate, distribute, or facilitate any malicious, harmful, or
                  dangerous software, including but not limited to malware, spyware, adware,
                  ransomware, keyloggers, trojans, viruses, worms, rootkits, or any other
                  software designed to harm, exploit, or gain unauthorized access to computers,
                  networks, data, or users.
                </p>
                <p>
                  You agree not to use the Service to create extensions that engage in data
                  harvesting, user tracking, phishing, click fraud, ad injection, search
                  engine manipulation, browser hijacking, cryptocurrency mining without user
                  consent, unauthorized data collection, privacy violations, or any other
                  deceptive, fraudulent, or harmful activity. You further agree not to create
                  extensions that infringe upon the intellectual property rights of others,
                  violate the privacy rights of others, facilitate illegal activities, or
                  violate the terms of service or policies of Google, the Chrome Web Store, or
                  any other platform or service.
                </p>
                <p>
                  You agree not to attempt to probe, scan, test, or exploit the vulnerability
                  of the Service or any system, network, or server connected to the Service.
                  You agree not to scrape, crawl, spider, or use any automated means to access,
                  extract data from, or interact with the Service without our express prior
                  written consent. You agree not to interfere with, disrupt, or impose an
                  unreasonable burden on the Service, its infrastructure, or the networks or
                  servers connected to the Service.
                </p>
                <p>
                  You agree not to attempt to bypass, circumvent, or defeat any security
                  features, rate limits, credit restrictions, access controls, or usage
                  limitations implemented in the Service. You agree not to use the Service in
                  any manner that could damage, disable, overburden, or impair the Service or
                  interfere with any other party's use and enjoyment of the Service. You agree
                  not to use the Service to send unsolicited communications, spam, chain
                  letters, or promotional materials.
                </p>
                <p>
                  Violation of this acceptable use policy may result in immediate and permanent
                  termination of your account and access to the Service, forfeiture of all
                  credits and subscription benefits, and potential legal action. We reserve the
                  right to investigate and take appropriate action against any user who violates
                  this policy, including but not limited to reporting violations to law
                  enforcement authorities and cooperating with law enforcement investigations.
                  We may, at our sole discretion, remove or disable access to any content or
                  extensions that we determine to be in violation of these Terms, without prior
                  notice and without liability to you.
                </p>
              </div>
            </section>

            {/* 10. Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                10. Third-Party Services
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  The Service integrates with, relies upon, and utilizes various third-party
                  services, platforms, and providers in order to deliver its functionality.
                  These third-party services include, but are not limited to: Stripe for
                  payment processing and subscription management; Supabase for database
                  hosting, authentication, and backend infrastructure; various AI model
                  providers including OpenRouter, Google Gemini, OpenAI, Anthropic Claude, and
                  DeepSeek for artificial intelligence processing; and various other hosting,
                  content delivery, analytics, and infrastructure providers.
                </p>
                <p>
                  You acknowledge and agree that extendr is not responsible for the
                  availability, reliability, performance, accuracy, security, or functionality
                  of any third-party service. Third-party services may experience outages,
                  downtime, errors, data loss, security breaches, performance degradation,
                  API changes, pricing changes, or discontinuation at any time and without
                  notice. extendr shall not be liable for any loss, damage, inconvenience, or
                  inability to use the Service resulting from any failure, error, outage, or
                  issue with any third-party service, regardless of the duration or severity
                  of such failure.
                </p>
                <p>
                  Your use of third-party services through the Service is subject to the
                  respective terms of service, privacy policies, and acceptable use policies
                  of each third-party provider. It is your responsibility to review and comply
                  with the terms and policies of all third-party services that you use through
                  the Service. extendr does not endorse, warrant, or guarantee any third-party
                  service, and your use of such services is at your own risk.
                </p>
                <p>
                  In the event that a third-party service upon which the Service depends becomes
                  unavailable, changes its terms or pricing, discontinues its service, or
                  otherwise ceases to function in a manner that affects the Service, extendr
                  may, at its sole discretion, substitute an alternative service, modify the
                  Service's functionality, or discontinue affected features. extendr shall not
                  be liable for any changes to the Service resulting from third-party service
                  issues, and no refund, credit, or compensation shall be provided in
                  connection with such changes.
                </p>
                <p>
                  AI model providers may change their models, capabilities, pricing, terms of
                  service, content policies, rate limits, or availability at any time. The
                  quality, accuracy, speed, and availability of AI-generated responses may vary
                  depending on the AI model provider and may change over time. extendr does not
                  control the AI models and cannot guarantee consistent output quality,
                  response times, or availability across different AI providers or over time.
                </p>
              </div>
            </section>

            {/* 11. Service Availability and Uptime */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                11. Service Availability and Uptime
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  <span className="text-white font-semibold">
                    There is no guarantee that extendr will work 100% of the time.
                  </span>{" "}
                  The Service is provided on an "as-available" basis, and we do not warrant,
                  guarantee, or promise any specific level of uptime, availability,
                  reliability, or performance. The Service may be temporarily or permanently
                  unavailable due to scheduled maintenance, unscheduled maintenance, system
                  upgrades, server failures, network issues, software bugs, security incidents,
                  third-party service outages, or any other reason.
                </p>
                <p>
                  We reserve the right to perform maintenance on the Service at any time,
                  with or without prior notice. Maintenance windows may result in temporary
                  unavailability of all or part of the Service. We will make reasonable efforts
                  to minimize disruption during maintenance, but we do not guarantee that
                  maintenance will not affect your access to or use of the Service. No refund,
                  credit, extension of billing cycle, or other compensation shall be provided
                  for any downtime or service interruption, regardless of duration or cause.
                </p>
                <p>
                  extendr shall not be liable for any failure to perform, or delay in
                  performing, any of its obligations under these Terms if such failure or delay
                  results from circumstances beyond our reasonable control, including but not
                  limited to acts of God, natural disasters, earthquakes, floods, hurricanes,
                  tornadoes, fires, epidemics, pandemics, war, terrorism, civil unrest, riots,
                  strikes, labor disputes, government actions, embargoes, sanctions,
                  cyberattacks, distributed denial-of-service (DDoS) attacks, hacking,
                  ransomware attacks, power outages, internet outages, telecommunications
                  failures, hardware failures, software failures, third-party service
                  failures, or any other force majeure event.
                </p>
                <p>
                  You acknowledge that the internet and cloud-based services are inherently
                  unreliable and that interruptions, delays, and errors are inevitable. You
                  agree that extendr shall not be liable for any loss of data, loss of
                  projects, loss of credits, loss of work in progress, or any other loss or
                  damage resulting from service interruptions, regardless of whether such
                  interruptions are planned or unplanned, brief or extended, partial or
                  complete. You are solely responsible for maintaining your own backups of any
                  important data, projects, or extension files.
                </p>
                <p>
                  We do not provide any service level agreement (SLA) and do not guarantee any
                  minimum uptime percentage. Any uptime statistics, performance metrics, or
                  availability claims made on the Service or in marketing materials are provided
                  for informational purposes only and do not constitute a guarantee, warranty,
                  or contractual commitment. Our sole obligation in the event of a service
                  outage is to use commercially reasonable efforts to restore the Service, and
                  we shall have no liability whatsoever for any failure to restore the Service
                  within any particular timeframe.
                </p>
              </div>
            </section>

            {/* 12. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                12. Limitation of Liability
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL EXTENDR,
                  ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUBSIDIARIES,
                  SUCCESSORS, ASSIGNS, LICENSORS, OR SERVICE PROVIDERS (COLLECTIVELY, THE
                  "EXTENDR PARTIES") BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                  CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO
                  DAMAGES FOR LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF DATA, LOSS OF
                  GOODWILL, LOSS OF BUSINESS OPPORTUNITIES, LOSS OF USE, BUSINESS
                  INTERRUPTION, COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, OR ANY
                  OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS,
                  YOUR USE OF OR INABILITY TO USE THE SERVICE, ANY AI-GENERATED CONTENT, ANY
                  EXTENSIONS CREATED USING THE SERVICE, OR ANY OTHER MATTER RELATING TO THE
                  SERVICE, REGARDLESS OF THE THEORY OF LIABILITY (WHETHER IN CONTRACT, TORT,
                  STRICT LIABILITY, OR OTHERWISE) AND REGARDLESS OF WHETHER THE EXTENDR PARTIES
                  HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL AGGREGATE
                  LIABILITY OF THE EXTENDR PARTIES FOR ALL CLAIMS ARISING OUT OF OR RELATING
                  TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU
                  TO EXTENDR DURING THE TWELVE (12) MONTH PERIOD IMMEDIATELY PRECEDING THE
                  EVENT GIVING RISE TO THE CLAIM, OR ONE HUNDRED UNITED STATES DOLLARS
                  ($100.00 USD), WHICHEVER IS GREATER. THIS LIMITATION APPLIES TO ALL CLAIMS
                  IN THE AGGREGATE, NOT ON A PER-CLAIM BASIS.
                </p>
                <p>
                  The limitations of liability set forth in this section shall apply to the
                  fullest extent permitted by law in the applicable jurisdiction. Some
                  jurisdictions do not allow the exclusion or limitation of certain types of
                  damages. In such jurisdictions, the liability of the extendr Parties shall be
                  limited to the maximum extent permitted by the laws of that jurisdiction.
                  Nothing in these Terms shall exclude or limit liability for death or personal
                  injury caused by negligence, fraud, or fraudulent misrepresentation, or any
                  other liability that cannot be excluded or limited by applicable law.
                </p>
                <p>
                  You acknowledge and agree that the limitations of liability set forth in this
                  section are fundamental elements of the agreement between you and extendr and
                  that extendr would not provide the Service without such limitations. You
                  further acknowledge that the fees charged for the Service reflect the
                  allocation of risk set forth in these Terms, including the limitations of
                  liability, and that such limitations shall apply even if any limited remedy
                  fails of its essential purpose.
                </p>
                <p>
                  Without limiting the foregoing, the extendr Parties shall not be liable for
                  any damages or losses resulting from: (a) your reliance on AI-Generated
                  Content; (b) any errors, bugs, vulnerabilities, or defects in extensions
                  created using the Service; (c) any rejection, removal, or suspension of your
                  extensions from the Chrome Web Store or any other platform; (d) any
                  unauthorized access to or use of your account or data; (e) any interruption,
                  suspension, or termination of the Service; (f) any actions or omissions of
                  third-party service providers; (g) any loss of data, projects, or extension
                  files; (h) any harm caused by extensions you create to end users; or (i) any
                  other matter relating to the Service.
                </p>
              </div>
            </section>

            {/* 13. Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                13. Disclaimer of Warranties
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS, WITHOUT ANY
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT
                  PERMITTED BY APPLICABLE LAW, THE EXTENDR PARTIES EXPRESSLY DISCLAIM ALL
                  WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT
                  NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, RELIABILITY,
                  COMPLETENESS, SECURITY, COMPATIBILITY, AND ANY WARRANTIES ARISING FROM
                  COURSE OF DEALING, COURSE OF PERFORMANCE, OR USAGE OF TRADE.
                </p>
                <p>
                  WITHOUT LIMITING THE FOREGOING, EXTENDR MAKES NO WARRANTY OR REPRESENTATION
                  THAT: (A) THE SERVICE WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS; (B) THE
                  SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR VIRUS-FREE;
                  (C) THE RESULTS OBTAINED FROM THE USE OF THE SERVICE WILL BE ACCURATE,
                  RELIABLE, COMPLETE, OR USEFUL; (D) THE QUALITY OF ANY AI-GENERATED CONTENT
                  WILL MEET YOUR EXPECTATIONS; (E) ANY ERRORS OR DEFECTS IN THE SERVICE WILL
                  BE CORRECTED; (F) THE SERVICE WILL BE COMPATIBLE WITH ANY PARTICULAR
                  HARDWARE, SOFTWARE, BROWSER, OR OPERATING SYSTEM; (G) THE SERVICE WILL BE
                  AVAILABLE IN ANY PARTICULAR JURISDICTION OR LOCATION; OR (H) ANY EXTENSIONS
                  CREATED USING THE SERVICE WILL FUNCTION CORRECTLY, SECURELY, OR AS INTENDED.
                </p>
                <p>
                  You acknowledge that you have not relied on any representation, warranty, or
                  statement made by extendr or any of its agents, employees, or representatives
                  that is not expressly set forth in these Terms. Any advice, guidance,
                  recommendations, or information provided by extendr or through the Service,
                  whether oral or written, shall not create any warranty or expand the scope
                  of the warranties expressly disclaimed herein.
                </p>
                <p>
                  You assume all risk and responsibility for your use of the Service, including
                  but not limited to the risk of loss of data, damage to your computer system
                  or devices, loss of revenue or profits, and any other consequences arising
                  from your use of the Service or reliance on AI-Generated Content. No
                  information or advice, whether oral or written, obtained by you from extendr
                  or through the Service shall create any warranty not expressly stated in
                  these Terms.
                </p>
                <p>
                  This disclaimer of warranties applies to the fullest extent permitted by
                  applicable law. Some jurisdictions do not allow the exclusion of implied
                  warranties, so some of the above exclusions may not apply to you. In such
                  jurisdictions, the warranties of the extendr Parties are limited to the
                  shortest duration and the narrowest scope permitted by law. To the extent
                  that any implied warranty cannot be fully disclaimed, such warranty is
                  limited to the duration of thirty (30) days from the date you first use the
                  Service.
                </p>
              </div>
            </section>

            {/* 14. Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                14. Indemnification
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  You agree to indemnify, defend, and hold harmless extendr and all of the
                  extendr Parties from and against any and all claims, demands, actions,
                  lawsuits, proceedings, investigations, liabilities, damages, losses, costs,
                  and expenses (including but not limited to reasonable attorneys' fees, court
                  costs, expert witness fees, and settlement costs) arising out of or in
                  connection with: (a) your use of the Service; (b) your violation of these
                  Terms; (c) your violation of any applicable law, regulation, or right of any
                  third party; (d) any content you create, generate, upload, distribute, or
                  publish using the Service; (e) any extensions you create, distribute, publish,
                  or deploy using the Service; (f) any harm caused by extensions you create to
                  end users or third parties; (g) any claim that AI-Generated Content you use
                  infringes the intellectual property rights of any third party; (h) your
                  negligence or willful misconduct; or (i) any breach of your representations
                  or warranties set forth in these Terms.
                </p>
                <p>
                  This indemnification obligation shall survive the termination or expiration
                  of these Terms and your use of the Service. extendr reserves the right, at
                  its own expense, to assume the exclusive defense and control of any matter
                  subject to indemnification by you, in which case you agree to cooperate fully
                  with extendr in asserting any available defenses. You agree not to settle any
                  claim subject to indemnification without the prior written consent of extendr.
                </p>
                <p>
                  You acknowledge that the creation and distribution of browser extensions
                  carries inherent risks, including the potential for data breaches, privacy
                  violations, security vulnerabilities, intellectual property infringement,
                  regulatory violations, and harm to end users. You accept full responsibility
                  for all such risks associated with extensions you create using the Service,
                  and you agree that extendr bears no responsibility for any consequences
                  arising from your extensions.
                </p>
                <p>
                  Your indemnification obligations extend to any claims brought by end users
                  of your extensions, users of websites or services affected by your extensions,
                  platform operators (including Google and the Chrome Web Store), government
                  agencies or regulatory authorities, intellectual property holders, and any
                  other third parties who may be affected by your use of the Service or the
                  extensions you create. You agree to maintain adequate insurance coverage to
                  satisfy your indemnification obligations, and extendr may require proof of
                  such coverage upon request.
                </p>
              </div>
            </section>

            {/* 15. Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                15. Termination
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  extendr reserves the right to suspend or terminate your account and access
                  to the Service at any time, for any reason or no reason, with or without
                  prior notice, and without liability to you. Reasons for termination may
                  include, but are not limited to: violation of these Terms, suspected
                  fraudulent or illegal activity, abuse of the Service, failure to pay
                  applicable fees, extended inactivity, requests by law enforcement or
                  government agencies, or discontinuation of the Service in whole or in part.
                </p>
                <p>
                  You may cancel your subscription and terminate your account at any time
                  through the Service's settings page or by contacting support. However,
                  cancellation of your subscription does not entitle you to any refund, credit,
                  or pro-rata adjustment for any remaining time on your current billing cycle.
                  Upon cancellation, you will continue to have access to paid features until
                  the end of your current billing cycle, after which your account will be
                  downgraded to the free tier or deactivated, at our sole discretion.
                </p>
                <p>
                  Upon termination of your account, whether by you or by extendr, all licenses
                  granted to you under these Terms shall immediately terminate, and you must
                  cease all use of the Service. extendr may, at its sole discretion, delete
                  all data, projects, extensions, and other content associated with your
                  account, and extendr shall have no obligation to retain, return, or provide
                  copies of any such data or content. You are solely responsible for
                  downloading and backing up any data, projects, or extension files you wish
                  to preserve before terminating your account.
                </p>
                <p>
                  The following provisions of these Terms shall survive termination: Sections
                  relating to Intellectual Property, Limitation of Liability, Disclaimer of
                  Warranties, Indemnification, Governing Law and Dispute Resolution,
                  Severability, and Entire Agreement, as well as any other provisions that by
                  their nature should survive termination.
                </p>
                <p>
                  In the event that extendr discontinues the Service entirely, extendr will
                  make reasonable efforts to provide advance notice to users, but shall not be
                  obligated to do so. No refund, credit, or compensation of any kind shall be
                  provided upon discontinuation of the Service, and extendr shall not be liable
                  for any damages or losses resulting from the discontinuation of the Service.
                </p>
              </div>
            </section>

            {/* 16. Modifications to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                16. Modifications to Terms
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  extendr reserves the right, at its sole and absolute discretion, to modify,
                  amend, update, replace, or supplement these Terms at any time and from time
                  to time. Any modifications to these Terms shall become effective immediately
                  upon posting to the Service, unless a later effective date is expressly
                  stated. We may, but are not obligated to, provide notice of material changes
                  to these Terms via email, in-app notification, or a prominent notice on the
                  Service.
                </p>
                <p>
                  Your continued use of the Service following the posting of any modifications
                  to these Terms shall constitute your binding acceptance of such modifications.
                  If you do not agree to any modification of these Terms, your sole and
                  exclusive remedy is to discontinue use of the Service and terminate your
                  account. It is your sole responsibility to review these Terms periodically
                  to stay informed of any changes. Your failure to review these Terms does not
                  relieve you of your obligation to comply with the most current version of
                  these Terms.
                </p>
                <p>
                  We may also modify, update, or change the Service's Privacy Policy,
                  acceptable use policies, or other policies referenced in these Terms.
                  Changes to such policies shall be governed by the same modification and
                  acceptance procedures described in this section. In the event of any conflict
                  between these Terms and any other policy or agreement referenced herein,
                  these Terms shall control unless expressly stated otherwise.
                </p>
              </div>
            </section>

            {/* 17. Governing Law and Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                17. Governing Law and Dispute Resolution
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws
                  of the State of Delaware, United States of America, without regard to its
                  conflict of laws principles. You agree that any legal action or proceeding
                  arising out of or relating to these Terms or the Service that is not subject
                  to arbitration shall be brought exclusively in the state or federal courts
                  located in the State of Delaware, and you hereby consent to the personal
                  jurisdiction and venue of such courts.
                </p>
                <p>
                  <span className="text-white font-semibold">ARBITRATION AGREEMENT:</span>{" "}
                  You and extendr agree that any dispute, claim, or controversy arising out of
                  or relating to these Terms, the Service, your use of the Service, or the
                  relationship between you and extendr (collectively, "Disputes") shall be
                  resolved exclusively through final and binding individual arbitration,
                  rather than in court, except that either party may bring individual claims in
                  small claims court if the claims qualify. The Federal Arbitration Act governs
                  the interpretation and enforcement of this arbitration agreement.
                </p>
                <p>
                  <span className="text-white font-semibold">CLASS ACTION WAIVER:</span>{" "}
                  YOU AND EXTENDR AGREE THAT EACH PARTY MAY BRING DISPUTES AGAINST THE OTHER
                  PARTY ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER
                  IN ANY PURPORTED CLASS, COLLECTIVE, REPRESENTATIVE, OR CONSOLIDATED ACTION
                  OR PROCEEDING. THE ARBITRATOR SHALL NOT CONSOLIDATE MORE THAN ONE PERSON'S
                  OR ENTITY'S CLAIMS AND SHALL NOT OTHERWISE PRESIDE OVER ANY FORM OF A CLASS,
                  COLLECTIVE, REPRESENTATIVE, OR CONSOLIDATED PROCEEDING. IF THIS CLASS ACTION
                  WAIVER IS FOUND TO BE UNENFORCEABLE, THEN THE ENTIRETY OF THIS ARBITRATION
                  AGREEMENT SHALL BE NULL AND VOID.
                </p>
                <p>
                  Arbitration shall be administered by the American Arbitration Association
                  ("AAA") in accordance with its Consumer Arbitration Rules then in effect.
                  The arbitration shall be conducted by a single neutral arbitrator selected in
                  accordance with AAA procedures. The arbitration shall take place in the State
                  of Delaware, or at another location mutually agreed upon by the parties. The
                  arbitrator shall apply the substantive laws of the State of Delaware. The
                  arbitrator's decision shall be final and binding and may be entered as a
                  judgment in any court of competent jurisdiction.
                </p>
                <p>
                  Notwithstanding the foregoing, either party may seek injunctive or other
                  equitable relief in any court of competent jurisdiction to prevent the
                  actual or threatened infringement, misappropriation, or violation of the
                  other party's intellectual property rights, confidential information, or
                  proprietary rights. Any claim arising under these Terms must be brought
                  within one (1) year after the cause of action arises, or such claim shall
                  be permanently barred. This one-year limitation period applies regardless
                  of any statute of limitations that might otherwise apply.
                </p>
              </div>
            </section>

            {/* 18. Severability */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                18. Severability
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  If any provision, clause, or part of these Terms is found to be invalid,
                  illegal, void, or unenforceable by a court of competent jurisdiction or an
                  arbitrator, such finding shall not affect the validity, legality, or
                  enforceability of the remaining provisions, clauses, or parts of these Terms,
                  which shall continue in full force and effect. The invalid, illegal, or
                  unenforceable provision shall be modified to the minimum extent necessary to
                  make it valid, legal, and enforceable while preserving the original intent
                  of the parties as closely as possible.
                </p>
                <p>
                  If modification of the invalid provision is not possible, the invalid
                  provision shall be deemed severed from these Terms, and the remaining
                  provisions shall be interpreted and enforced as if the invalid provision had
                  never been included. The parties agree to negotiate in good faith a
                  replacement provision that is valid, legal, and enforceable and that most
                  closely reflects the original intent of the severed provision.
                </p>
                <p>
                  The invalidity or unenforceability of any provision of these Terms in one
                  jurisdiction shall not affect the validity or enforceability of that provision
                  in any other jurisdiction. Each provision of these Terms shall be construed
                  as independently enforceable, even if one or more provisions are found to be
                  unenforceable.
                </p>
              </div>
            </section>

            {/* 19. Entire Agreement */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                19. Entire Agreement
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  These Terms, together with the Privacy Policy and any other legal notices,
                  policies, or agreements published by extendr on the Service, constitute the
                  entire agreement between you and extendr regarding the subject matter hereof
                  and supersede all prior and contemporaneous agreements, proposals,
                  representations, warranties, understandings, and communications between you
                  and extendr, whether written or oral, regarding the Service.
                </p>
                <p>
                  No waiver of any provision of these Terms shall be deemed a further or
                  continuing waiver of such provision or any other provision, and the failure
                  of extendr to assert any right or provision under these Terms shall not
                  constitute a waiver of such right or provision. Any waiver of any provision
                  of these Terms shall be effective only if in writing and signed by an
                  authorized representative of extendr.
                </p>
                <p>
                  The section headings in these Terms are for convenience only and shall not
                  affect the interpretation of these Terms. The word "including" and variations
                  thereof shall be deemed to be followed by the phrase "without limitation."
                  References to "days" mean calendar days unless otherwise specified. These
                  Terms shall not be construed against the drafter. You may not assign or
                  transfer your rights or obligations under these Terms without the prior
                  written consent of extendr. extendr may freely assign or transfer its rights
                  and obligations under these Terms without restriction and without notice to
                  you.
                </p>
              </div>
            </section>

            {/* 20. Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                20. Contact Information
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  If you have any questions, concerns, or inquiries regarding these Terms and
                  Conditions, the Service, your account, or any other matter related to
                  extendr, please contact us at:
                </p>
                <p>
                  <span className="text-white font-semibold">Email:</span>{" "}
                  <a
                    href="mailto:hi@extendr.dev"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    hi@extendr.dev
                  </a>
                </p>
                <p>
                  We will make reasonable efforts to respond to your inquiry in a timely
                  manner. However, we do not guarantee any specific response time and shall
                  not be liable for any delays in responding to communications. All notices
                  from extendr to you may be sent to the email address associated with your
                  account, and such notices shall be deemed received upon sending, regardless
                  of whether you actually receive or read the notice.
                </p>
                <p>
                  Any formal legal notices to extendr must be sent to the email address above
                  and must include your full legal name, account email address, a detailed
                  description of the matter, and any supporting documentation. Legal notices
                  sent to any other address or channel may not be received and shall not be
                  deemed effective.
                </p>
              </div>
            </section>
          </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
