import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

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
  title: "YO",
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
      className={`${inter.variable} ${manuka.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-clip bg-black font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
