"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

const integrations = [
  {
    id: "javascript",
    label: "JavaScript",
    detail: "Browser application",
    description: "Use Authorization Code with PKCE in the browser. A published browser SDK and CDN script are not available yet, so this starter shows the official MAX Auth endpoints without pretending an SDK package exists.",
    code: [
      'const MAX_AUTH = {',
      '  issuer: "https://auth.max-ai.name.ng",',
      '  authorizeEndpoint: "https://auth.max-ai.name.ng/api/v1/oauth/authorize",',
      '  tokenEndpoint: "https://auth.max-ai.name.ng/api/v1/oauth/token",',
      '  userInfoEndpoint: "https://auth.max-ai.name.ng/api/v1/oauth/userinfo",',
      '  responseType: "code",',
      '  codeChallengeMethod: "S256",',
      '};',
    ].join("\n"),
  },
  {
    id: "react",
    label: "React",
    detail: "Single-page application",
    description: "Configure your React app as a public OAuth client. Generate and validate state and PKCE values in the browser, and register the exact callback URL in your MAX Auth application.",
    code: [
      'export const maxAuthConfig = {',
      '  clientId: import.meta.env.VITE_MAX_AUTH_CLIENT_ID,',
      '  redirectUri: window.location.origin + "/auth/callback",',
      '  authorizeUrl: "https://auth.max-ai.name.ng/api/v1/oauth/authorize",',
      '  tokenUrl: "https://auth.max-ai.name.ng/api/v1/oauth/token",',
      '  userInfoUrl: "https://auth.max-ai.name.ng/api/v1/oauth/userinfo",',
      '  responseType: "code",',
      '  codeChallengeMethod: "S256",',
      '};',
    ].join("\n"),
  },
  {
    id: "nextjs",
    label: "Next.js",
    detail: "App Router / server-rendered app",
    description: "Keep confidential credentials on the server. Use a server-side callback to validate state and exchange the authorization code; use PKCE for the authorization request.",
    code: [
      'export const maxAuthConfig = {',
      '  clientId: process.env.MAX_AUTH_CLIENT_ID!,',
      '  clientSecret: process.env.MAX_AUTH_CLIENT_SECRET, // server only',
      '  redirectUri: process.env.MAX_AUTH_REDIRECT_URI!,',
      '  authorizeUrl: "https://auth.max-ai.name.ng/api/v1/oauth/authorize",',
      '  tokenUrl: "https://auth.max-ai.name.ng/api/v1/oauth/token",',
      '  userInfoUrl: "https://auth.max-ai.name.ng/api/v1/oauth/userinfo",',
      '};',
    ].join("\n"),
  },
  {
    id: "node",
    label: "Node.js",
    detail: "Backend / API server",
    description: "Store confidential client credentials in server environment variables. Your backend should own the callback, validate state and PKCE, and perform the token exchange.",
    code: [
      'const maxAuth = {',
      '  clientId: process.env.MAX_AUTH_CLIENT_ID,',
      '  clientSecret: process.env.MAX_AUTH_CLIENT_SECRET,',
      '  redirectUri: process.env.MAX_AUTH_REDIRECT_URI,',
      '  authorizeEndpoint: "https://auth.max-ai.name.ng/api/v1/oauth/authorize",',
      '  tokenEndpoint: "https://auth.max-ai.name.ng/api/v1/oauth/token",',
      '  userInfoEndpoint: "https://auth.max-ai.name.ng/api/v1/oauth/userinfo",',
      '};',
    ].join("\n"),
  },
  {
    id: "flutter",
    label: "Flutter",
    detail: "iOS and Android",
    description: "Use the system browser for authorization and Authorization Code with PKCE. Register the exact app redirect URI. Do not embed a client secret in the mobile app.",
    code: [
      'const maxAuthIssuer = "https://auth.max-ai.name.ng";',
      'const maxAuthAuthorizeEndpoint =',
      '    "$maxAuthIssuer/api/v1/oauth/authorize";',
      'const maxAuthTokenEndpoint =',
      '    "$maxAuthIssuer/api/v1/oauth/token";',
      'const maxAuthUserInfoEndpoint =',
      '    "$maxAuthIssuer/api/v1/oauth/userinfo";',
      'const maxAuthResponseType = "code";',
      'const maxAuthCodeChallengeMethod = "S256";',
    ].join("\n"),
  },
  {
    id: "android",
    label: "Android",
    detail: "Kotlin",
    description: "Launch authorization in the system browser using Authorization Code with PKCE. Handle the registered redirect URI in your app and keep the client as a public client.",
    code: [
      'object MaxAuthConfig {',
      '    const val ISSUER = "https://auth.max-ai.name.ng"',
      '    const val AUTHORIZE_ENDPOINT =',
      '        "$ISSUER/api/v1/oauth/authorize"',
      '    const val TOKEN_ENDPOINT =',
      '        "$ISSUER/api/v1/oauth/token"',
      '    const val USERINFO_ENDPOINT =',
      '        "$ISSUER/api/v1/oauth/userinfo"',
      '    const val RESPONSE_TYPE = "code"',
      '    const val CODE_CHALLENGE_METHOD = "S256"',
      '}',
    ].join("\n"),
  },
  {
    id: "ios",
    label: "iOS",
    detail: "Swift",
    description: "Use the system authentication session and Authorization Code with PKCE. Register the app callback URI with MAX Auth and never ship a confidential client secret in the app.",
    code: [
      'enum MaxAuthConfig {',
      '    static let issuer = URL(string: "https://auth.max-ai.name.ng")!',
      '    static let authorizeEndpoint = issuer.appending(path: "/api/v1/oauth/authorize")',
      '    static let tokenEndpoint = issuer.appending(path: "/api/v1/oauth/token")',
      '    static let userInfoEndpoint = issuer.appending(path: "/api/v1/oauth/userinfo")',
      '    static let responseType = "code"',
      '    static let codeChallengeMethod = "S256"',
      '}',
    ].join("\n"),
  },
  {
    id: "rest",
    label: "REST API",
    detail: "Any language",
    description: "Integrate directly with the OAuth endpoints from any HTTP client. The authorization request and token exchange must follow the registered client configuration and PKCE requirements.",
    code: [
      '# MAX Auth OAuth endpoints',
      'GET  https://auth.max-ai.name.ng/api/v1/oauth/authorize',
      'POST https://auth.max-ai.name.ng/api/v1/oauth/token',
      'GET  https://auth.max-ai.name.ng/api/v1/oauth/userinfo',
      '',
      '# Authorization Code + PKCE',
      '# Use response_type=code and code_challenge_method=S256.',
      '# Exchange the returned code at the token endpoint.',
    ].join("\n"),
  },
];

export function DeveloperIntegration() {
  const [selected, setSelected] = useState("javascript");
  const [copied, setCopied] = useState(false);
  const active = integrations.find((item) => item.id === selected) ?? integrations[0];

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)]">
      <div>
        <label htmlFor="max-auth-platform" className="mb-2 block text-xs font-semibold uppercase tracking-[.14em] text-ink-muted">
          Choose your platform
        </label>
        <select
          id="max-auth-platform"
          value={selected}
          onChange={(event) => { setSelected(event.target.value); setCopied(false); }}
          className="w-full appearance-none rounded-md border border-glass-border bg-base px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-ink-muted"
        >
          {integrations.map((item) => (
            <option key={item.id} value={item.id}>{item.label} — {item.detail}</option>
          ))}
        </select>

        <div className="mt-5 border border-glass-border bg-base p-4">
          <p className="text-sm font-semibold">{active.label}</p>
          <p className="mt-2 text-xs leading-5 text-ink-muted">{active.description}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Link href="/developer/docs" className="inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-ink-faint underline-offset-4 hover:decoration-ink">
            Read integration docs <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden border border-glass-border bg-base">
        <div className="flex items-center justify-between gap-3 border-b border-glass-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Integration starter</p>
            <p className="mt-0.5 text-[11px] text-ink-faint">OAuth 2.0 · OpenID Connect · PKCE</p>
          </div>
          <button
            type="button"
            onClick={copySnippet}
            className="inline-flex shrink-0 items-center gap-2 border border-glass-border px-3 py-2 text-xs font-semibold text-ink transition hover:bg-glass-hover"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="max-h-[360px] overflow-auto p-4 text-xs leading-6 text-ink-muted sm:p-5"><code>{active.code}</code></pre>
      </div>
      <p className="text-xs leading-5 text-ink-faint lg:col-span-2">
        Official language SDK packages and CDN script tags are not published yet. These platform-specific starters use the active MAX Auth OAuth endpoints; they are not presented as installable SDKs. Never expose a confidential client secret in browser or mobile code.
      </p>
    </div>
  );
}
