import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body
        style={{
          background:
            "linear-gradient(90deg, rgba(255,171,0,0.5) 0%, rgba(178,120,38,0) 10%, rgba(9,9,121,0) 90%, rgba(255,171,0,0.5) 100%)",
        }}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
