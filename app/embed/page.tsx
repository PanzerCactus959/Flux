"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Button, Field } from "@/components/ui";

const inputCls =
  "w-full rounded-xl border border-surface-line bg-ink-900 px-3.5 py-2.5 text-content-hi placeholder:text-content-faint focus:border-flow-peri";

const BTN_STYLE =
  "display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;background:linear-gradient(90deg,#36E0C8,#6E8BFF,#B57BFF);color:#0B0E1A;font-weight:700;font-family:system-ui,-apple-system,sans-serif;text-decoration:none;font-size:15px";

export default function EmbedPage() {
  const [link, setLink] = useState("");
  const [label, setLabel] = useState("Stream USDC to me");

  const origin = typeof window !== "undefined" ? window.location.origin : "https://fluxmoney-chi.vercel.app";
  const target = link.trim();
  const labelText = label.trim() || "Stream USDC to me";
  const ready = target.length > 0;

  const htmlSnippet = useMemo(
    () => `<a href="${target}" target="_blank" rel="noopener noreferrer" style="${BTN_STYLE}">◇ ${labelText}</a>`,
    [target, labelText],
  );
  const mdSnippet = useMemo(
    () => `[![Stream on Flux](${origin}/flux-badge.svg)](${target})`,
    [origin, target],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-24 pt-10">
        <h1 className="font-display text-2xl font-semibold text-content-hi">Embed a “Stream me” button</h1>
        <p className="mt-1 text-sm text-content-muted">
          Drop a Flux button or badge into your GitHub README, blog, Notion or website. Anyone who
          clicks it opens your link and can stream USDC to you.
        </p>

        <div className="mt-8 space-y-5">
          <Field label="Your Flux link" hint="Paste your Flux Page or pay-link.">
            <input
              className={inputCls}
              placeholder={`${origin}/p?d=…`}
              spellCheck={false}
              value={link}
              onChange={(e) => setLink(e.target.value.trim())}
            />
          </Field>
          <Field label="Button label">
            <input
              className={inputCls}
              value={label}
              maxLength={32}
              onChange={(e) => setLabel(e.target.value)}
            />
          </Field>
        </div>

        {!ready && (
          <p className="mt-4 text-sm text-content-muted">
            No link yet? <Link href="/page" className="text-flow-peri hover:text-flow-aqua">Create your Flux Page →</Link>
          </p>
        )}

        {ready && (
          <>
            {/* Preview */}
            <div className="mt-8">
              <div className="mb-3 text-xs uppercase tracking-wide text-content-faint">Preview</div>
              <div className="flex flex-wrap items-center gap-5 rounded-xl2 border border-surface-line bg-surface p-6">
                <a href={target} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px",
                  borderRadius: 12, background: "linear-gradient(90deg,#36E0C8,#6E8BFF,#B57BFF)",
                  color: "#0B0E1A", fontWeight: 700, textDecoration: "none", fontSize: 15,
                }}>◇ {labelText}</a>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <a href={target} target="_blank" rel="noopener noreferrer">
                  <img src="/flux-badge.svg" alt="Stream on Flux" width={232} height={44} />
                </a>
              </div>
            </div>

            {/* Snippets */}
            <Snippet title="HTML button (websites, blogs)" code={htmlSnippet} />
            <Snippet title="Markdown badge (GitHub README, Notion)" code={mdSnippet} />
            <Snippet title="Plain link" code={target} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Snippet({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-content-hi">{title}</span>
        <Button variant="subtle" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</Button>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-surface-line bg-ink-900 p-3.5 text-xs text-content">
        <code>{code}</code>
      </pre>
    </div>
  );
}
