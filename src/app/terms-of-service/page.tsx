import type { Metadata } from "next";
import { StaticPageShell } from "@/components/layout/StaticPageShell";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsOfServicePage() {
  return (
    <StaticPageShell title="Terms of Service" updated="January 2026">
      <p className="text-ink">
        This is placeholder legal copy for the MAX Auth frontend. Replace this page with
        legal-reviewed text before launch.
      </p>

      <section>
        <h2>1. Your MAX Account</h2>
        <p>
          You&apos;re responsible for keeping your credentials secure and for activity that
          happens under your account. Notify us immediately if you suspect unauthorized access —
          you can review and revoke sessions and devices at any time.
        </p>
      </section>

      <section>
        <h2>2. Acceptable use</h2>
        <p>
          Don&apos;t use your MAX Account to violate applicable law, abuse other users, or
          attempt to compromise the security of MAX products or other accounts.
        </p>
      </section>

      <section>
        <h2>3. Third-party integrations</h2>
        <p>
          &ldquo;Continue with MAX AI&rdquo; will allow third-party developers to let you sign in
          using your MAX Account. You control which apps have access from Connected Apps, and can
          revoke access at any time.
        </p>
      </section>

      <section>
        <h2>4. Termination</h2>
        <p>
          You may delete your account at any time from the Security page. We may suspend
          accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2>5. Changes to these terms</h2>
        <p>We may update these terms as the MAX AI Ecosystem grows. Material changes will be communicated in-app.</p>
      </section>
    </StaticPageShell>
  );
}
