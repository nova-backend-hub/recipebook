import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "RecipeBook Command Center - Admin Panel",
  description: "Protected administrative tools monitoring AI pipelines, recipe queues, telemetry, feature flags, and FCM broadcasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>"/>
      </head>
      <body className="bg-[#0a0a0a] text-neutral-100 font-sans min-h-screen flex flex-col justify-between antialiased">
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
