# MAX Auth Web SDK

The browser SDK adds the MAX-branded automatic sign-in prompt to a website registered in MAX Auth. It uses the existing OAuth authorization-code flow with PKCE (S256); it does not use a client secret in the browser.

> **Integration status:** This is an initial browser integration. Before enabling it for production, verify the deployed API origin, registered redirect URI, OAuth consent route, CORS policy for token and userinfo endpoints, and popup callback flow in real browsers. The callback URL must be a page on the same origin as the page that opens the popup.

## 1. Register the website

In MAX Auth, create an OAuth client for your website.

- Select **SPA** for a browser-only app, or **WEB** if your server will perform the token exchange.
- Add the exact callback URL to the registered redirect URIs.
- Add the site origin (scheme + host + port, no path) to authorized origins.
- Enable only the scopes your app actually needs.
- Use the public Client ID in the browser. Never put a client secret in client-side code.

For a local development site, use localhost only where your MAX Auth app configuration permits it. Production sites should use HTTPS.

## 2. Add the automatic prompt

Place this snippet in your shared HTML layout, preferably near the end of body. Replace both example values with the real Client ID and callback URL registered for this app.

~~~html
<script
  src="https://auth.max-ai.name.ng/sdk/max-auth.js"
  data-client-id="YOUR_MAX_AUTH_CLIENT_ID"
  data-redirect-uri="https://example.com/max-auth/callback"
  data-scope="openid profile email"
  data-auto-prompt="true"
  data-prompt-delay="1500"
  data-placement="top-right"
  data-frequency="session"
  defer
></script>
~~~

Available attributes:

| Attribute | Values | Meaning |
| --- | --- | --- |
| data-client-id | Client ID | Identifies the registered OAuth app. |
| data-redirect-uri | Exact registered URL | Popup callback URL on your website. |
| data-scope | Space-separated scopes | Must be a subset of the app's approved scopes. |
| data-auto-prompt | true / false | Automatically show the MAX prompt. |
| data-prompt-delay | Milliseconds | Delay before showing the prompt; defaults to 1500. |
| data-placement | top-right / bottom-right | Popup position. |
| data-frequency | once / session / always | How dismissal suppresses future prompts on that origin. |

The script only prompts on a site where the developer installed it and supplied its own registered Client ID. The SDK does not inject itself into unrelated websites.

## 3. Add the callback page

Create a callback page at the exact URL registered in MAX Auth. Add the callback-mode script below to that page. Do not set data-auto-prompt on the callback page.

~~~html
<script
  src="https://auth.max-ai.name.ng/sdk/max-auth.js"
  data-client-id="YOUR_MAX_AUTH_CLIENT_ID"
  data-max-auth-callback
  defer
></script>
<p>Returning to the website…</p>
~~~

The callback page should be on the same origin as the page that launched the popup, because the SDK checks the postMessage origin and OAuth state before exchanging the authorization code. Do not put third-party scripts on this callback page unless necessary.

## 4. Listen for sign-in

The SDK exposes window.MAXAuth. Subscribe before the user clicks the prompt or a custom button.

~~~html
<script>
  window.addEventListener("maxauth:success", function (event) {
    const { profile, accessToken } = event.detail;
    console.log("Signed in:", profile);
    // Send the token to your own backend over HTTPS if your app needs a server session.
    // Your backend must validate it; do not trust client-supplied profile fields.
  });

  window.addEventListener("maxauth:cancel", function () {
    console.log("MAX sign-in was cancelled.");
  });

  window.addEventListener("maxauth:error", function (event) {
    console.error("MAX Auth error:", event.detail.error);
  });
</script>
~~~

Or disable automatic prompting and open sign-in from your own button:

~~~html
<script
  src="https://auth.max-ai.name.ng/sdk/max-auth.js"
  data-client-id="YOUR_MAX_AUTH_CLIENT_ID"
  data-redirect-uri="https://example.com/max-auth/callback"
  data-scope="openid profile email"
  data-auto-prompt="false"
  defer
></script>
<button type="button" onclick="MAXAuth.signIn()">Continue with MAX</button>
~~~

You may also configure it in JavaScript:

~~~js
MAXAuth.initialize({
  clientId: "YOUR_MAX_AUTH_CLIENT_ID",
  redirectUri: "https://example.com/max-auth/callback",
  scope: "openid profile email",
  autoPrompt: true,
  promptDelay: 1500,
  placement: "top-right",
  frequency: "session"
});
~~~

## Events

- maxauth:prompt — automatic prompt was displayed.
- maxauth:success — code was exchanged and userinfo loaded. Event detail includes profile, accessToken, tokenType, expiresIn, and scope.
- maxauth:cancel — user cancelled or the authorization endpoint returned an error.
- maxauth:error — token exchange or profile request failed.
- maxauth:popupblocked — browser blocked the popup; SDK falls back to navigating the current tab.
- maxauth:timeout — no callback arrived within two minutes.

## Production notes

- This initial SDK is for browser-based public clients and uses PKCE. Do not include a client secret in a web page.
- The access token is kept in memory by the SDK; it is not written to localStorage. Reloading the page clears it.
- For higher-security applications, prefer a server-side web-client flow and an HttpOnly, Secure, SameSite session cookie created by your backend.
- Automatic prompts must remain dismissible, should not cover site content, and must respect browser settings. Browsers may block popups; the normal sign-in button should remain available.
- Test exact redirect URI matching, CORS, Content Security Policy, ad/content blockers, mobile browsers, popup blocking, cancellation, expired sessions, and token failures before production use.
