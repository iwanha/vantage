// Routes server-side fetch through the corporate proxy when HTTPS_PROXY is set
// (needed for local dev behind a proxy). No-op in production (e.g. Vercel),
// where no proxy env var is present.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.HTTPS_PROXY) {
    const { setGlobalDispatcher, EnvHttpProxyAgent } = await import("undici");
    setGlobalDispatcher(new EnvHttpProxyAgent());
  }
}
