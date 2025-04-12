import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Snowgoose - Terms of Service
      </h1>
      <p className="text-sm text-gray-600 mb-8 text-center">
        Last Updated: 4-12-2025
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-400 leading-relaxed">
          By accessing or using the Snowgoose SaaS application (the
          &quot;Service&quot;), you (&quot;User&quot; or &quot;you&quot;) agree
          to be bound by these Terms of Service (&quot;Terms&quot;). If you do
          not agree to these Terms, do not access or use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. Description of Service
        </h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          Snowgoose provides a platform that offers unified access to various
          third-party artificial intelligence models (&quot;AI Models&quot;)
          through a monthly subscription. The Service may include features such
          as:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-gray-400 leading-relaxed">
          <li>
            Access to the latest features supported by vendor APIs from selected
            AI Model providers (e.g., Anthropic, OpenAI, Google).
          </li>
          <li>
            A &quot;Persona&quot; system allowing users to leverage predefined
            and create custom system prompts for interacting with AI Models.
          </li>
          <li>
            Control over the &quot;Output Format&quot; of AI-generated content,
            including options like Markdown, JSON, HTML, and CSV.
          </li>
          <li>
            Potential future support for vision (image upload) and image
            creation, depending on the capabilities of the underlying AI Models.
          </li>
          <li>
            Planned future integration of the Model Context Protocol for
            Anthropic models and adjustable thinking mode support for compatible
            models.
          </li>
        </ul>
        <p className="text-gray-400 leading-relaxed">
          Snowgoose acts as an intermediary and does not own or control the AI
          Models provided by third parties. The output generated through the
          Service is based on the capabilities and limitations of those AI
          Models.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. User Accounts and Subscriptions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-2">Account Creation:</h3>
            <p className="text-gray-400 leading-relaxed">
              To use the Service, you may need to create an account. You are
              responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account.
              You agree to provide accurate and complete information when
              creating your account and to update it as necessary.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Subscription Plans:</h3>
            <p className="text-gray-400 leading-relaxed">
              Snowgoose offers monthly subscription plans with varying features
              and usage allowances, as described on our pricing page.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Billing and Payments:</h3>
            <p className="text-gray-400 leading-relaxed">
              You agree to pay the subscription fees in accordance with the plan
              you have selected. Payments will be billed on a recurring monthly
              basis to the payment method you provide. You are responsible for
              ensuring that your payment information is accurate and up-to-date.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">
              Subscription Changes and Cancellation:
            </h3>
            <p className="text-gray-400 leading-relaxed">
              You can manage or cancel your subscription through your account
              settings. Changes or cancellations will typically take effect at
              the end of your current billing cycle. No refunds will be provided
              for partial subscription periods.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Free Trials:</h3>
            <p className="text-gray-400 leading-relaxed">
              Snowgoose may offer free trial periods. If you sign up for a free
              trial, your subscription will automatically renew into a paid
              subscription at the end of the trial period unless you cancel
              before the trial expires.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          4. Acceptable Use Policy
        </h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          You agree to use the Service in compliance with these Terms and all
          applicable laws and regulations. You shall not:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-gray-400 leading-relaxed">
          <li>
            Use the Service for any illegal, harmful, or unethical purpose.
          </li>
          <li>
            Generate or disseminate content that is defamatory, libelous,
            harassing, abusive, obscene, discriminatory, or otherwise
            objectionable.
          </li>
          <li>
            Infringe upon the intellectual property rights of others, including
            copyrights, trademarks, and patents.
          </li>
          <li>Transmit any viruses, malware, or other harmful code.</li>
          <li>
            Attempt to gain unauthorized access to the Service or its systems.
          </li>
          <li>
            Interfere with or disrupt the operation of the Service or other
            users&apos; access to it.
          </li>
          <li>
            Use the Service in a manner that violates the terms of service of
            any underlying AI Models.
          </li>
          <li>
            Circumvent any usage limits or restrictions imposed by Snowgoose or
            the AI Model providers.
          </li>
          <li>
            Use the Service to generate content that promotes hate speech,
            terrorism, or violence.
          </li>
          <li>
            Misrepresent AI-generated content as human-created without
            appropriate disclosure.
          </li>
        </ul>
        <p className="text-gray-400 leading-relaxed">
          Snowgoose reserves the right to suspend or terminate your access to
          the Service if you violate this Acceptable Use Policy or these Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          5. Intellectual Property
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-2">Snowgoose IP:</h3>
            <p className="text-gray-400 leading-relaxed">
              The Service, including its design, features, and underlying
              software, is owned by Snowgoose and is protected by copyright,
              trademark, and other intellectual property laws. These Terms do
              not grant you any right, title, or interest in or to the Service,
              except for the limited right to use the Service in accordance with
              these Terms.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">
              User-Generated Content:
            </h3>
            <p className="text-gray-400 leading-relaxed">
              You retain ownership of the prompts and inputs you provide to the
              AI Models through the Service. The output generated by the AI
              Models is subject to the terms and conditions of the respective AI
              Model providers. Snowgoose does not claim any intellectual
              property rights in the output generated through the Service.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">
              Responsibility for Output:
            </h3>
            <p className="text-gray-400 leading-relaxed">
              You are solely responsible for reviewing and ensuring the accuracy
              and appropriateness of any output generated through the Service
              before using or distributing it. Snowgoose does not warrant the
              accuracy, completeness, or reliability of the output generated by
              the AI Models.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          6. Third-Party AI Models
        </h2>
        <p className="text-gray-400 leading-relaxed">
          You acknowledge and agree that your use of the Service involves
          interacting with AI Models provided by third parties. Your
          interactions with these AI Models are also subject to the terms of
          service and privacy policies of those third-party providers. Snowgoose
          is not responsible for the performance, accuracy, availability, or
          content of these AI Models.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          7. Disclaimer of Warranties
        </h2>
        <p className="text-gray-400 leading-relaxed uppercase">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
          WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
          NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF
          DEALING OR USAGE OF TRADE. SNOWGOOSE DOES NOT WARRANT THAT THE SERVICE
          WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR THAT THE OUTPUT
          GENERATED BY THE AI MODELS WILL BE ACCURATE, COMPLETE, OR RELIABLE.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          8. Limitation of Liability
        </h2>
        <p className="text-gray-400 leading-relaxed uppercase">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
          SNOWGOOSE, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS,
          SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING, WITHOUT
          LIMITATION, DAMAGES FOR LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
          INTANGIBLE LOSSES) ARISING OUT OF OR RELATING TO YOUR ACCESS TO OR USE
          OF (OR INABILITY TO ACCESS OR USE) THE SERVICE, WHETHER BASED ON
          WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER
          LEGAL THEORY, EVEN IF SNOWGOOSE HAS BEEN ADVISED OF THE POSSIBILITY OF
          SUCH DAMAGES. IN ANY CASE, THE AGGREGATE LIABILITY OF SNOWGOOSE TO YOU
          FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE SHALL NOT
          EXCEED THE AMOUNT YOU PAID TO SNOWGOOSE IN THE TWELVE (12) MONTHS
          PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
        <p className="text-gray-400 leading-relaxed">
          You agree to indemnify, defend, and hold harmless Snowgoose, its
          affiliates, directors, officers, employees, agents, suppliers, and
          licensors from and against any and all claims, liabilities, damages,
          losses, costs, expenses, or fees (including reasonable attorneys&apos;
          fees) arising out of or relating to: (a) your access to or use of the
          Service; (b) your violation of these Terms; (c) your User-Generated
          Content; or (d) your infringement of any intellectual property or
          other right of any person or entity.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          10. Governing Law and Dispute Resolution
        </h2>
        <p className="text-gray-400 leading-relaxed">
          These Terms shall be governed by and construed in accordance with the
          laws of Arizona, without regard to its conflict of law provisions. Any
          dispute arising out of or relating to these Terms or the Service shall
          be subject to the exclusive jurisdiction of the courts located in
          Arizona.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          11. Changes to These Terms
        </h2>
        <p className="text-gray-400 leading-relaxed">
          Snowgoose reserves the right to modify or update these Terms at any
          time. We will provide notice of significant changes, such as by
          posting the updated Terms on our website or through other reasonable
          means. Your continued use of the Service after the effective date of
          any changes constitutes your acceptance of the revised Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Entire Agreement</h2>
        <p className="text-gray-400 leading-relaxed">
          These Terms constitute the entire agreement between you and Snowgoose
          regarding the Service and supersede all prior or contemporaneous
          communications and proposals, whether oral or written.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
        <p className="text-gray-400 leading-relaxed">
          If you have any questions about these Terms, please contact us at{" "}
          <a
            href="mailto:support@snowgoose.app"
            className="text-blue-600 hover:underline"
          >
            support@snowgoose.app
          </a>
          .
        </p>
      </section>
    </div>
  );
}
