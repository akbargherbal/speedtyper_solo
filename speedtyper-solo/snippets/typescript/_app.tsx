import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import NextNProgress from "nextjs-progressbar";
import { Layout } from "../common/components/Layout";
import { Stream } from "../components/Stream";

function MyApp({ Component, pageProps }: AppProps) {
  const title = "SpeedTyper Solo | Typing practice for programmers";
  return (
    <>
      <div
        style={{
          height: "100vh",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        <Head>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="keywords"
            content="typing practice, coding speed, programming speed, code faster, speed coding, coding practice, typing tutor, learn programming, learn coding"
          />
          <meta
            name="description"
            content="SpeedTyper Solo is a typing practice tool for programmers. Practice typing your own code to become a faster and more accurate programmer."
          />
          <meta
            property="og:description"
            content="SpeedTyper Solo is a typing practice tool for programmers. Practice typing your own code to become a faster and more accurate programmer."
          />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1024" />
          <meta property="og:image:height" content="1024" />
          <meta property="og:type" content="website" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <NextNProgress
          options={{ showSpinner: false }}
          color="#d6bbfa"
          height={2}
        />
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Stream />
      </div>
      {/* SOLO MODE: TikTok banner removed */}
    </>
  );
}

export default MyApp;