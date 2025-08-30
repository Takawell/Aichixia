import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen bg-[#0a0f1c] text-gray-200 font-sans">
      <Component {...pageProps} />
    </main>
  );
}
