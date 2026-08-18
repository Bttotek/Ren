import { createFileRoute, Link } from "@tanstack/react-router";

const BASE_URL = "https://www.bttotek.in";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      {
        title: "Privacy Policy | BTTOTEK Solutions",
      },
      {
        name: "description",
        content:
          "Read the BTTOTEK Solutions Privacy Policy covering personal information, calculator usage, cookies, Google Analytics, advertising and user rights.",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        property: "og:site_name",
        content: "BTTOTEK Solutions",
      },
      {
        property: "og:title",
        content: "Privacy Policy | BTTOTEK Solutions",
      },
      {
        property: "og:description",
        content:
          "Learn how BTTOTEK Solutions handles personal information, cookies, analytics, advertising and contact enquiries.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: `${BASE_URL}/privacy`,
      },
      {
        name: "twitter:card",
        content: "summary",
      },
      {
        name: "twitter:title",
        content: "Privacy Policy | BTTOTEK Solutions",
      },
      {
        name: "twitter:description",
        content:
          "Privacy, cookies, analytics, advertising and user rights at BTTOTEK Solutions.",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: `${BASE_URL}/privacy`,
      },
    ],
  }),

  component: Privacy,
});

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Introduction",
    p: [
      "BTTOTEK Solutions provides online calculators, articles and related website features for civil construction, engineering estimation, property and real-estate calculations.",
      "This Privacy Policy explains what information may be collected when you use our website, how that information may be used, and the choices available to you.",
    ],
  },
  {
    h: "2. What This Policy Covers",
    p: [
      "This policy applies to information processed through the BTTOTEK website, including calculator pages, account features, contact forms, analytics and advertising features that are actually enabled.",
      "Some calculators can be used without an account. Where a feature does not require personal information, users can generally use it without submitting identifying details.",
    ],
  },
  {
    h: "4. Calculator Information",
    p: [
      "Many BTTOTEK calculators perform calculations directly in your web browser. Information entered into a calculator is generally processed in your browser for the calculation and may remain in browser memory or local storage depending on the feature. Do not assume that every calculator is a private or permanent data store.",
      "If a particular feature allows you to save information to an account or workspace, information submitted through that feature may be stored so that you can access it later.",
      "Users should avoid entering confidential, sensitive or commercially secret information unless the relevant feature clearly requires it and the user is comfortable with its storage.",
    ],
  },
  {
    h: "4. Account Information",
    p: [
      "If you create an account, we may collect information such as your email address and other information that you voluntarily provide for account or workspace functionality.",
      "This information may be used to authenticate your account, provide requested features, maintain your workspace and communicate with you about your account.",
    ],
  },
  {
    h: "5. Contact Form Information",
    p: [
      "When you submit our contact form, we may collect the name, email address, phone number and message that you provide.",
      "We use this information to respond to your enquiry, provide support, investigate reported problems and communicate about your request.",
      "Please do not submit passwords, financial account credentials, confidential tender information or other sensitive information through the contact form.",
    ],
  },
  {
    h: "6. Cookies and Local Storage",
    p: [
      "BTTOTEK may use cookies, local storage and similar technologies for essential website functionality, authentication, preferences and security.",
      "For example, browser storage may be used to remember interface preferences such as theme settings. Authentication-related technologies may be used when you sign in to your account.",
      "Some third-party services used on the website may also use cookies or similar technologies according to their own policies.",
    ],
  },
  {
    h: "7. Google Analytics",
    p: [
      "Where Google Analytics is enabled on the website, BTTOTEK may use it to understand how visitors use the website, such as which pages are visited and how users interact with the site.",
      "Google Analytics may collect information such as device information, browser information, approximate location and website interaction data. This information is used for website measurement and improvement.",
      "Google processes information according to its own policies and terms. Users can learn more about Google's privacy practices through Google's official privacy resources.",
    ],
  },
  {
    h: "8. Advertising",
    p: [
      "Where advertising is enabled, BTTOTEK may display advertisements provided by third-party advertising services, including Google AdSense.",
      "Advertising providers may use cookies or similar technologies to deliver, measure and personalise advertising, subject to their own policies, configuration and applicable consent or legal requirements.",
      "Advertising preferences may vary depending on your location, browser settings, consent choices and the advertising services enabled on the website.",
      "BTTOTEK does not intentionally provide the contents of your private saved calculations or contact messages to advertising providers for advertising purposes.",
    ],
  },
  {
    h: "9. Third-Party Services",
    p: [
      "The website may use third-party services for hosting, authentication, analytics, database functionality, advertising and other technical operations.",
      "These providers may process information on our behalf or independently according to their own terms and privacy policies.",
      "We aim to use reputable services and only enable third-party functionality that is necessary for operating or improving the website.",
    ],
  },
  {
    h: "10. How Information Is Used",
    p: [
      "Information may be used to operate and maintain the website, provide requested services, authenticate accounts, respond to enquiries, improve calculators and website performance, understand website usage, prevent abuse and comply with applicable legal obligations.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    h: "11. Data Security",
    p: [
      "We take reasonable technical and organisational measures to protect information handled through the website. However, no internet transmission or electronic storage system can be guaranteed to be completely secure.",
      "Users should therefore avoid submitting highly sensitive information through public website forms.",
    ],
  },
  {
    h: "12. Data Retention",
    p: [
      "Information may be retained for as long as reasonably necessary to provide the requested service, maintain an account, respond to enquiries, maintain security, comply with legal obligations or resolve disputes.",
      "Retention periods may vary depending on the type of information and the purpose for which it was collected.",
    ],
  },
  {
    h: "13. Your Choices and Rights",
    p: [
      "Depending on your location and applicable law, you may have rights relating to access, correction, deletion, restriction or other processing of your personal information.",
      "You can contact us through our Contact page to ask questions about personal information associated with your account or enquiries. We may need to verify a request before acting on it, where permitted or required by law.",
    ],
  },
  {
    h: "14. Children's Privacy",
    p: [
      "BTTOTEK is primarily intended for general users, professionals and adults interested in construction, engineering and property-related information. We do not knowingly request personal information from children for purposes that are prohibited by applicable law.",
    ],
  },
  {
    h: "15. External Links",
    p: [
      "Our website may contain links to external websites or services. We are not responsible for the privacy practices, security or content of websites that we do not operate.",
      "We recommend reviewing the privacy policy of any external website before providing personal information.",
    ],
  },
  {
    h: "16. Changes to This Privacy Policy",
    p: [
      "We may update this Privacy Policy when our website, services, analytics, advertising or legal requirements change.",
      "When changes are made, the updated version will be published on this page together with an updated effective date.",
    ],
  },
];

function Privacy() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <article>
        <header>
          <p className="text-sm font-medium text-primary">
            BTTOTEK Solutions
          </p>

          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Effective date: August 18, 2026
          </p>

          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            This Privacy Policy explains how BTTOTEK Solutions handles
            information when you use our calculators, website, account
            features and contact services.
          </p>
        </header>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.h}>
              <h2 className="font-display text-xl font-bold text-foreground">
                {section.h}
              </h2>

              {section.p.map((paragraph, index) => (
                <p
                  key={index}
                  className="mt-3 text-sm leading-7 text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">
            Questions about privacy?
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If you have a question about this Privacy Policy or information
            associated with your use of BTTOTEK, please contact us.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Contact us
            </Link>

            <Link
              to="/disclaimer"
              className="inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Read Disclaimer
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
