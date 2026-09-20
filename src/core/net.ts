/**
 * Optional HTTP(S) proxy support for the global fetch(). Respects the standard
 * HTTPS_PROXY / HTTP_PROXY / ALL_PROXY (and lowercase) environment variables —
 * useful for users on corporate or regionally-filtered networks. Imported for
 * its side effect before any network call is made.
 */
import { ProxyAgent, setGlobalDispatcher } from "undici";

const proxyUrl =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy ||
  process.env.ALL_PROXY ||
  process.env.all_proxy;

if (proxyUrl) {
  try {
    const u = new URL(proxyUrl);
    const token = u.username
      ? "Basic " +
        Buffer.from(
          `${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}`
        ).toString("base64")
      : undefined;
    setGlobalDispatcher(new ProxyAgent({ uri: `${u.protocol}//${u.host}`, token }));
    if (process.env.UNO_DEBUG) process.stderr.write(`· using proxy ${u.host}\n`);
  } catch {
    /* malformed proxy URL — fall back to direct connection */
  }
}
