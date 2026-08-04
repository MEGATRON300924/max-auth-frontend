import type { Metadata } from "next";
import { StaticPageShell } from "@/components/layout/StaticPageShell";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <StaticPageShell title="Privacy Policy" updated="January 2026">
      <p className="text-ink">
        This is placeholder legal copy for the MAX Auth frontend. Replace this page with
        legal-reviewed text before launch — the structure below is a starting outline covering
        the areas a real MAX Account privacy policy should address.
      </p>

      <section>
        <h2>1. What we collect</h2>
        <p>
          Account details you provide directly (username, email, display name), technical
          information needed to keep your account secure (device fingerprints, IP addresses,
          login timestamps), and preferences you set for AI personalization.
        </p>
      </section>

      <section>
        <h2>2. How your MAX Account is used across products</h2>
        <p>
          Your MAX Account is the shared identity layer behind every product in the MAX AI
          Ecosystem. Signing in to one MAX product signs you in to the rest, and your core
          profile is shared across them so you don&apos;t have to manage separate accounts.
        </p>
      </section>

      <section>
        <h2>3. Security practices</h2>
        <p>
          Passwords are hashed with Argon2id and never stored in plain text. Sessions are
          tracked and revocable at any time from your Security and Devices pages. See our
          Security page in-app for a full activity log of your account.
        </p>
      </section>

      <section>
        <h2>4. Third-party connections</h2>
        <p>
          If you choose to link accounts like Google, GitHub, or Discord, we only store the
          minimum data needed to maintain that connection, and you can unlink at any time from
          Connected Apps.
        </p>
      </section>

      <section>
        <h2>5. Your rights</h2>
        <p>
          You can review, edit, or delete your account and its data at any time from your
          dashboard. Account deletion is available from the Security page.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>Questions about this policy can be directed to your account administrator.</p>
      </section>
    </StaticPageShell>
  );
}
