(function () {
  "use strict";

  var SCRIPT = document.currentScript;
  var AUTH_ORIGIN = "https://auth.max-ai.name.ng";
  var API_BASE = AUTH_ORIGIN + "/api/v1/oauth";
  var STORAGE_KEY = "max-auth-prompt-dismissed";
  var STYLE_ID = "max-auth-web-sdk-styles";
  var active = null;
  var accessToken = null;
  var listeners = new Map();

  function randomString(bytes) {
    var data = new Uint8Array(bytes);
    window.crypto.getRandomValues(data);
    return Array.from(data, function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
  }

  function base64Url(bytes) {
    var binary = "";
    bytes.forEach(function (byte) { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  async function createChallenge(verifier) {
    var digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return base64Url(new Uint8Array(digest));
  }

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent("maxauth:" + name, { detail: detail }));
    (listeners.get(name) || []).forEach(function (callback) {
      try { callback(detail); } catch (error) { setTimeout(function () { throw error; }); }
    });
  }

  function readConfig() {
    var script = SCRIPT || document.querySelector('script[data-client-id][src*="max-auth.js"]');
    if (!script) return {};
    return {
      clientId: script.getAttribute("data-client-id") || "",
      redirectUri: script.getAttribute("data-redirect-uri") || "",
      scope: (script.getAttribute("data-scope") || "openid profile email").trim(),
      autoPrompt: script.getAttribute("data-auto-prompt") === "true",
      delay: Math.max(0, Math.min(30000, Number(script.getAttribute("data-prompt-delay") === null ? 1500 : script.getAttribute("data-prompt-delay")) || 0)),
      placement: script.getAttribute("data-placement") === "bottom-right" ? "bottom-right" : "top-right",
      frequency: ["once", "session", "always"].indexOf(script.getAttribute("data-frequency")) >= 0
        ? script.getAttribute("data-frequency") : "session",
      callbackOnly: script.hasAttribute("data-max-auth-callback")
    };
  }

  var config = readConfig();

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "#max-auth-prompt{position:fixed;z-index:2147483000;width:min(350px,calc(100vw - 32px));padding:18px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;color:#171923;box-shadow:0 18px 55px #1018282b;font:14px/1.45 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-sizing:border-box;opacity:0;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease}"+
      "#max-auth-prompt.max-auth-visible{opacity:1;transform:translateY(0)}"+
      "#max-auth-prompt.max-auth-top-right{top:18px;right:18px}#max-auth-prompt.max-auth-bottom-right{bottom:18px;right:18px}"+
      "#max-auth-prompt *{box-sizing:border-box}#max-auth-prompt .max-auth-head{display:flex;align-items:center;gap:10px;padding-right:22px}"+
      "#max-auth-prompt .max-auth-mark{width:34px;height:34px;border-radius:11px;background:#edf4ff;color:#2563eb;display:grid;place-items:center;font-size:18px;font-weight:750;flex:none}"+
      "#max-auth-prompt .max-auth-title{font-size:15px;font-weight:700;letter-spacing:-.2px}#max-auth-prompt .max-auth-subtitle{font-size:12px;color:#667085;margin-top:2px}"+
      "#max-auth-prompt .max-auth-copy{font-size:13px;color:#475467;margin:14px 0 16px}"+
      "#max-auth-prompt .max-auth-actions{display:flex;gap:8px}#max-auth-prompt button{font:inherit;cursor:pointer;border:0}"+
      "#max-auth-prompt .max-auth-continue{flex:1;border-radius:999px;background:#2563eb;color:#fff;font-size:13px;font-weight:650;padding:10px 14px;min-height:40px}"+
      "#max-auth-prompt .max-auth-dismiss{border-radius:999px;background:#f2f4f7;color:#344054;font-size:13px;font-weight:600;padding:10px 13px}"+
      "#max-auth-prompt .max-auth-close{position:absolute;right:10px;top:10px;width:28px;height:28px;border-radius:8px;background:transparent;color:#667085;font-size:20px;line-height:1}"+
      "#max-auth-prompt button:focus-visible{outline:2px solid #2563eb;outline-offset:3px}@media(prefers-reduced-motion:reduce){#max-auth-prompt{transition:none}}";
    document.head.appendChild(style);
  }

  function shouldPrompt() {
    if (!config.clientId || !config.redirectUri || !config.autoPrompt || config.callbackOnly) return false;
    try {
      if (config.frequency === "once" && localStorage.getItem(STORAGE_KEY + ":" + config.clientId) === "1") return false;
      if (config.frequency === "session" && sessionStorage.getItem(STORAGE_KEY + ":" + config.clientId) === "1") return false;
    } catch (_) {}
    return true;
  }

  function markDismissed() {
    try {
      if (config.frequency === "once") localStorage.setItem(STORAGE_KEY + ":" + config.clientId, "1");
      if (config.frequency === "session") sessionStorage.setItem(STORAGE_KEY + ":" + config.clientId, "1");
    } catch (_) {}
  }

  function removePrompt() {
    var prompt = document.getElementById("max-auth-prompt");
    if (prompt) prompt.remove();
  }

  function showPrompt() {
    if (!shouldPrompt() || document.getElementById("max-auth-prompt")) return;
    injectStyles();
    var prompt = document.createElement("section");
    prompt.id = "max-auth-prompt";
    prompt.className = "max-auth-" + config.placement;
    prompt.setAttribute("role", "dialog");
    prompt.setAttribute("aria-label", "Sign in with MAX");
    prompt.innerHTML =
      '<button class="max-auth-close" type="button" aria-label="Dismiss sign-in prompt">&times;</button>' +
      '<div class="max-auth-head"><div class="max-auth-mark" aria-hidden="true">M</div><div><div class="max-auth-title">Sign in with MAX</div><div class="max-auth-subtitle">One account. Your choice.</div></div></div>' +
      '<p class="max-auth-copy">Use your MAX Account to sign in to this website securely.</p>' +
      '<div class="max-auth-actions"><button class="max-auth-continue" type="button">Continue with MAX</button><button class="max-auth-dismiss" type="button">Not now</button></div>';
    prompt.querySelector(".max-auth-close").addEventListener("click", function () { markDismissed(); removePrompt(); });
    prompt.querySelector(".max-auth-dismiss").addEventListener("click", function () { markDismissed(); removePrompt(); });
    prompt.querySelector(".max-auth-continue").addEventListener("click", function () {
      signIn().catch(function (error) { emit("error", { error: error }); });
    });
    document.body.appendChild(prompt);
    window.requestAnimationFrame(function () { prompt.classList.add("max-auth-visible"); });
    emit("prompt", { clientId: config.clientId });
  }

  function callbackHandler() {
    if (!config.callbackOnly || !window.opener) return;
    var params = new URLSearchParams(window.location.search);
    var payload = {
      type: "MAX_AUTH_CALLBACK",
      clientId: config.clientId,
      code: params.get("code"),
      state: params.get("state"),
      error: params.get("error"),
      errorDescription: params.get("error_description")
    };
    try {
      window.opener.postMessage(payload, window.location.origin);
      document.body.innerHTML = '<main style="font:15px system-ui;max-width:420px;margin:15vh auto;padding:24px;color:#202633"><h1 style="font-size:22px">Returning to your website…</h1><p>You can close this window if it does not close automatically.</p></main>';
      window.close();
    } catch (_) {}
  }

  async function signIn() {
    if (!config.clientId) throw new Error("MAX Auth: data-client-id is required.");
    if (!config.redirectUri) throw new Error("MAX Auth: data-redirect-uri is required and must be registered in MAX Auth.");
    if (!window.crypto || !window.crypto.subtle) throw new Error("MAX Auth requires a secure context (HTTPS) with Web Crypto support.");
    if (active && !active.closed) { active.focus(); return; }

    var state = randomString(24);
    var verifier = randomString(32);
    var width = 480, height = 700;
    var left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    var top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    // Open synchronously within the click gesture so popup blockers do not reject it.
    active = window.open("about:blank", "max-auth-sign-in", "popup=yes,width=" + width + ",height=" + height + ",left=" + left + ",top=" + top + ",resizable=yes,scrollbars=yes");
    var challenge = await createChallenge(verifier);
    var params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: config.scope,
      state: state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    var authUrl = API_BASE + "/authorize?" + params.toString();
    if (!active) {
      emit("popupblocked", { message: "The browser blocked the sign-in window. Allow popups or use a direct sign-in link." });
      window.location.assign(authUrl);
      return;
    }
    active.location = authUrl;
    var finished = false;
    var timeout = window.setTimeout(function () {
      if (!finished) emit("timeout", { message: "MAX sign-in is taking longer than expected." });
    }, 120000);

    function onMessage(event) {
      if (event.origin !== window.location.origin || !event.data || event.data.type !== "MAX_AUTH_CALLBACK") return;
      if (event.data.clientId !== config.clientId || event.data.state !== state) return;
      finished = true;
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      if (event.data.error) {
        emit("cancel", { error: event.data.error, description: event.data.errorDescription || "" });
        if (active && !active.closed) active.close();
        active = null;
        return;
      }
      if (!event.data.code) { emit("error", { error: new Error("MAX Auth callback did not include an authorization code.") }); return; }
      exchangeCode(event.data.code, verifier).then(function (tokens) {
        accessToken = tokens.access_token;
        return fetch(API_BASE + "/userinfo", { headers: { Authorization: "Bearer " + accessToken, Accept: "application/json" } })
          .then(function (response) { if (!response.ok) throw new Error("MAX Auth could not load the signed-in profile."); return response.json(); })
          .then(function (profile) {
            var result = { profile: profile, accessToken: accessToken, tokenType: tokens.token_type, expiresIn: tokens.expires_in, scope: tokens.scope };
            emit("success", result);
            if (active && !active.closed) active.close();
            active = null;
          });
      }).catch(function (error) { emit("error", { error: error }); });
    }
    window.addEventListener("message", onMessage);
  }

  async function exchangeCode(code, verifier) {
    var response = await fetch(API_BASE + "/token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: config.clientId,
        code: code,
        redirect_uri: config.redirectUri,
        code_verifier: verifier
      })
    });
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.error) throw new Error(body.error_description || body.message || "MAX Auth token exchange failed.");
    return body;
  }

  var api = {
    initialize: function (options) {
      options = options || {};
      Object.keys(options).forEach(function (key) {
        if (key === "clientId") config.clientId = options.clientId;
        if (key === "redirectUri") config.redirectUri = options.redirectUri;
        if (key === "scope") config.scope = options.scope;
        if (key === "autoPrompt") config.autoPrompt = Boolean(options.autoPrompt);
        if (key === "promptDelay") config.delay = Math.max(0, Number(options.promptDelay) || 0);
        if (key === "placement") config.placement = options.placement === "bottom-right" ? "bottom-right" : "top-right";
        if (key === "frequency" && ["once", "session", "always"].indexOf(options.frequency) >= 0) config.frequency = options.frequency;
      });
      if (config.autoPrompt) window.setTimeout(showPrompt, config.delay);
      return api;
    },
    signIn: signIn,
    getAccessToken: function () { return accessToken; },
    on: function (name, callback) {
      if (typeof callback !== "function") throw new TypeError("MAXAuth.on expects a callback.");
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
      return function () { listeners.set(name, (listeners.get(name) || []).filter(function (item) { return item !== callback; })); };
    },
    closePrompt: removePrompt
  };

  window.MAXAuth = api;

  if (config.callbackOnly) {
    callbackHandler();
  } else if (config.autoPrompt) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { window.setTimeout(showPrompt, config.delay); }, { once: true });
    else window.setTimeout(showPrompt, config.delay);
  }
})();