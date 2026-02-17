import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <title>Aichixia - Modern AI API Platform</title>
        <meta name="description" content="Build AI applications 10x faster with Aichixia's unified API. Access Claude, GPT, Gemini, DeepSeek and 20+ AI models through one OpenAI-compatible endpoint." />
        <meta name="keywords" content="AI API, OpenAI alternative, Claude API, GPT API, Gemini API, AI infrastructure, multi-model API, DeepSeek" />
        <meta name="author" content="Aichixia" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#3b82f6" />

        <link rel="canonical" href="https://www.aichixia.xyz" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.aichixia.xyz" />
        <meta property="og:site_name" content="Aichixia" />
        <meta property="og:title" content="Aichixia - Modern AI API Platform" />
        <meta property="og:description" content="Build AI applications 10x faster. Access Claude, GPT, Gemini, DeepSeek and 20+ AI models through one OpenAI-compatible endpoint. Sub-100ms latency, 99.9% uptime." />
        <meta property="og:image" content="https://www.aichixia.xyz/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Aichixia - Modern AI API Platform" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@aichixia" />
        <meta name="twitter:creator" content="@aichixia" />
        <meta name="twitter:title" content="Aichixia - Modern AI API Platform" />
        <meta name="twitter:description" content="Build AI applications 10x faster. Access Claude, GPT, Gemini, DeepSeek and 20+ AI models. Sub-100ms latency, 99.9% uptime." />
        <meta name="twitter:image" content="https://www.aichixia.xyz/og-image.png" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aichixia" />
        <meta name="application-name" content="Aichixia" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Aichixia",
              "url": "https://www.aichixia.xyz",
              "logo": "https://www.aichixia.xyz/logo.png",
              "description": "Unified AI API platform providing access to 20+ AI models including Claude, GPT, Gemini, and DeepSeek.",
              "sameAs": [
                "https://twitter.com/aichixia",
                "https://github.com/aichiversee",
                "https://discord.gg/aichixia"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "contact@aichixia.xyz",
                "contactType": "customer support"
              }
            })
          }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
