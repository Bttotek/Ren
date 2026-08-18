import { createFileRoute, Link } from "@tanstack/react-router";

const BASE_URL = "https://www.bttotek.in";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      {
        title: "Terms of Service | BTTOTEK Solutions",
      },
      {
        name: "description",
        content:
          "Read the Terms of Service for BTTOTEK Solutions, covering calculator use, accounts, saved estimates, exports, intellectual property, advertising, acceptable use and user responsibilities.",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "author",
        content: "BTTOTEK Solutions",
      },
      {
        property: "og:site_name",
        content: "BTTOTEK Solutions",
      },
      {
        property: "og:title",
        content: "Terms of Service | BTTOTEK Solutions",
      },
      {
        property: "og:description",
        content:
          "Terms governing the use of BTTOTEK Solutions calculators, tools, accounts, estimates and website content.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: `${BASE_URL}/terms`,
      },
      {
        name: "twitter:card",
        content: "summary",
      },
      {
        name: "twitter:title",
        content: "Terms of Service | BTTOTEK Solutions",
      },
      {
        name: "twitter:description",
        content:
          "Terms governing the use of BTTOTEK Solutions calculators, tools, accounts, estimates and website content.",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: `${BASE_URL}/terms`,
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Terms of Service",
          url: `${BASE_URL}/terms`,
          description:
            "Terms governing the use of BTTOTEK Solutions calculators, tools, accounts, estimates and website content.",
          isPartOf: {
            "@type": "WebSite",
            name: "BTTOTEK Solutions",
            url: BASE_URL,
          },
          publisher: {
            "@type": "Organization",
            name: "BTTOTEK Solutions",
            url: BASE_URL,
          },
        }),
      },
    ],
  }),

  component: Terms,
});

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Agreement to these terms",
    p: [
      "By accessing or using BTTOTEK Solutions, you acknowledge these Terms of Service. If you do not agree with these terms, please do not use the website or its services. Where applicable law requires a different form of consent, that legal requirement takes precedence.",
      "If you use BTTOTEK Solutions on behalf of a company, employer, client or other organisation, you confirm that you have authority to accept these terms on its behalf.",
    ],
  },

  {
    h: "2. About BTTOTEK Solutions",
    p: [
      "BTTOTEK Solutions provides online calculators, estimating tools, educational articles and related features for civil engineering, construction estimating, quantity surveying, structural estimation and real-estate calculations.",
      "The tools are designed to assist users with preliminary calculations, planning, budgeting, estimating and analysis. They are not intended to replace professional engineering, architectural, legal, financial or other specialist advice.",
    ],
  },

  {
    h: "3. Engineering and calculation disclaimer",
    p: [
      "Calculator results are indicative estimates based on the information and assumptions entered by the user. Results may vary depending on project conditions, applicable standards, code editions, material specifications, construction practices, local regulations and market rates.",
      "Before using any result for construction, procurement, structural work, tendering, contractual commitments or financial decisions, you should independently verify the result against project drawings, specifications, the applicable and current IS code or other governing standard, project specifications, site conditions and current local information.",
      "BTTOTEK Solutions does not provide certified structural designs, statutory approvals, professional engineering certificates, quantity-surveyor certifications or financial advice through these calculators.",
    ],
  },

  {
    h: "4. Accuracy and limitations",
    p: [
      "We make reasonable efforts to maintain useful formulas, assumptions and technical information, but we do not guarantee that every result will always be complete, current, accurate or suitable for a particular project.",
      "You are responsible for reviewing inputs, units, assumptions, rates and outputs before relying on any calculation.",
    ],
  },

  {
    h: "5. User accounts",
    p: [
      "Some features may require an account. You are responsible for providing accurate information and protecting your login credentials.",
      "You are responsible for activity performed through your account. Do not share your credentials in a manner that compromises account security.",
      "We may restrict or suspend access where an account is used for abuse, automated scraping, malicious activity, unauthorised access attempts or violation of these terms.",
    ],
  },

  {
    h: "6. Saved estimates and exported files",
    p: [
      "Where the platform provides saved estimates, saved calculations or export features, those features are provided for user convenience.",
      "You should maintain your own backup of important estimates, calculations, reports and exported files. We do not guarantee permanent availability or retention of saved workspace data.",
      "You remain responsible for checking exported documents and calculations before using them in tenders, BOQs, reports, procurement documents or client submissions.",
    ],
  },

  {
    h: "7. Acceptable use",
    p: [
      "You must not use the website to conduct unlawful activities, distribute malicious software, interfere with the operation of the service, attempt unauthorised access, abuse APIs or forms, scrape content at unreasonable scale, or circumvent security and access controls.",
      "You must not submit misleading, fraudulent, abusive, defamatory or spam content through reviews, contact forms, comments or other interactive features.",
    ],
  },

  {
    h: "8. Intellectual property",
    p: [
      "The BTTOTEK Solutions name, branding, website design, original written content, calculator interfaces, source code and original educational materials are protected by applicable intellectual-property laws.",
      "You may use calculator results generated for your own legitimate work, subject to your responsibility to verify those results. You may link to our pages and quote reasonable excerpts with appropriate attribution.",
      "Copying, republishing, mirroring, selling or substantially reproducing our original website content or source code without permission is not permitted.",
    ],
  },

  {
    h: "9. Technical formulas and standards",
    p: [
      "Engineering principles, mathematical formulas, unit conversions and publicly available technical standards are not claimed as proprietary by BTTOTEK Solutions. Our intellectual-property rights relate to our original implementation, presentation, explanations, interface and content.",
      "References to engineering standards should be independently checked against the applicable and current official publication before professional use.",
    ],
  },

  {
    h: "10. Advertising and third-party services",
    p: [
      "BTTOTEK Solutions may display advertisements, including advertising supplied by third-party advertising networks. Advertisements may be selected or personalised according to the policies and settings of the relevant advertising provider.",
      "The website may also contain links to third-party websites, services or applications. We do not control those third parties and are not responsible for their content, availability, policies or practices. Your use of a third-party service may also be subject to that provider's separate terms and privacy policy.",
    ],
  },

  {
    h: "11. Privacy",
    p: [
      "Your use of the website is also subject to our Privacy Policy, which explains how information is handled, including account information, contact submissions, cookies, local storage and advertising technologies.",
    ],
  },

  {
    h: "12. Using Results Responsibly",
    p: [
      "Before relying on a calculator result, check the source of each input, confirm the units, review the assumptions and compare the output with the applicable project documents or official information.",
      "For engineering, construction, legal, tax, property or financial decisions with material consequences, use appropriately qualified professionals or the relevant authority where required.",
    ],
  },

  {
    h: "14. Availability and changes",
    p: [
      "We may modify, improve, suspend or discontinue any calculator, feature, article or part of the service at any time.",
      "We may also update formulas, assumptions, default values, technical information and these Terms of Service as the platform develops or applicable standards and practices change.",
    ],
  },

  {
    h: "14. Disclaimer of warranties",
    p: [
      "The website and its calculators are provided on an 'as is' and 'as available' basis to the extent permitted by applicable law. We do not guarantee uninterrupted availability, error-free operation or that every calculator will meet every user's particular requirements.",
    ],
  },

  {
    h: "15. Limitation of liability",
    p: [
      "To the maximum extent permitted by applicable law, BTTOTEK Solutions shall not be responsible for losses arising from reliance on an unverified calculator result, including construction cost overruns, material shortages, tender errors, project delays, financial losses or other indirect or consequential losses.",
      "Users should independently verify important calculations and decisions with appropriately qualified professionals.",
    ],
  },

  {
    h: "16. Governing law",
    p: [
      "These Terms of Service are governed by the laws of India, subject to applicable consumer and other mandatory legal protections.",
      "Any dispute shall be handled by the courts having appropriate jurisdiction over BTTOTEK Solutions, subject to applicable law.",
    ],
  },

  {
    h: "17. Changes to these terms",
    p: [
      "We may update these terms from time to time. The updated version will be published on this page with a revised effective date. Continued use of the website after an update indicates acceptance of the revised terms, to the extent permitted by law.",
    ],
  },

  {
    h: "18. Contact",
    p: [
      "If you have questions about these Terms of Service, please contact BTTOTEK Solutions through the contact page.",
    ],
  },
];

function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Terms of Service
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Effective from 18 August 2026 · Last reviewed for the current website
          services.
        </p>
      </div>

      <div className="surface-panel mb-8 p-5">
        <h2 className="font-display text-lg font-bold">
          Important engineering notice
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          BTTOTEK calculators provide indicative results for planning,
          estimating and educational purposes. Always verify important
          calculations against project drawings, applicable standards, site
          conditions and qualified professional advice before execution.
        </p>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.h}>
            <h2 className="font-display text-xl font-bold">
              {section.h}
            </h2>

            {section.p.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          For information about how personal information and advertising
          technologies are handled, please read our{" "}
          <Link
            to="/privacy"
            className="font-medium text-primary underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Need help or want to contact us? Visit our{" "}
          <Link
            to="/contact"
            className="font-medium text-primary underline underline-offset-4"
          >
            Contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
