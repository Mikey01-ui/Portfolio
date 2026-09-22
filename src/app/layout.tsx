import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const manuka = localFont({
  src: [
    {
      path: "../../public/fonts/Manuka-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-manuka",
  display: "swap",
  fallback: ["Impact", "Arial Black", "sans-serif"],
});

export const metadata: Metadata = {
  title: "YO • Cinematic 3D Camera Rig",
  description: "Scroll-driven 3D camera hero — lens sequence with GSAP.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manuka.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-clip bg-black font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
