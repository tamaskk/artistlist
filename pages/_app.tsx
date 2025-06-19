import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ArtistProvider } from "@/context/mainContext";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Toaster richColors position="top-center" closeButton />
      <ArtistProvider>
        <Component {...pageProps} />
      </ArtistProvider>
    </SessionProvider>
  );
}
