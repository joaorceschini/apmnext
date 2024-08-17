import "./globals.css";

import localFont from "next/font/local";
import type { Metadata } from "next";

const cpmono = localFont({
  src: [
    {
      path: "./cpmonov07apm/CPMono_v07_Light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "./cpmonov07apm/CPMono_v07_Black.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./cpmonov07apm/CPMono_v07_Plain.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./cpmonov07apm/CPMono_v07_Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    template: "%s | apm test",
    default: "apm test",
  },
  description: "apm test peak performance peak design peak experience",
  metadataBase: new URL(defaultUrl),
  keywords: [
    "apm",
    "test",
    "actions per minute",
    "apm test",
    "performance",
    "font mono",
    "webgl",
    "pixijs",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${cpmono.className} antialiased`}>{children}</body>
    </html>
  );
}
