import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
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
  title: "RecipeBook - AI-Powered Recipe Extraction & Feed Platform",
  description: "Upload screenshots, capture food instructions with AI, scale ingredients instantly, sync offline, and join the global cooking community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍳</text></svg>"/>
      </head>
      <body className="bg-neutral-50 text-neutral-900 font-sans min-h-screen flex flex-col antialiased">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 glass-panel border-b border-neutral-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Branding Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-neutral-900 group-hover:text-brand-700 transition-colors">
                Recipe<span className="text-brand-600">Book</span>
              </span>
            </Link>

            {/* Nav Menu Links */}
            <nav className="hidden md:flex items-center gap-8 font-medium text-neutral-600 text-sm">
              <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              <Link href="/#features" className="hover:text-brand-600 transition-colors">Features</Link>
              <Link href="/community" className="hover:text-brand-600 transition-colors">Community Feed</Link>
              <Link href="/#download" className="hover:text-brand-600 transition-colors">Download App</Link>
            </nav>

            {/* Control buttons */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-neutral-700 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-100">
                Log In
              </Link>
              <Link href="/community" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase bg-brand-600 text-white hover:bg-brand-700 active:scale-95 transition-all px-4.5 py-2.5 rounded-xl shadow-lg shadow-brand-500/15">
                Explore Feed
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* Core Main Views */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer System */}
        <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            
            {/* Branding pitch */}
            <div className="space-y-4 col-span-1 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="font-display font-bold text-lg text-white">RecipeBook</span>
              </div>
              <p className="text-sm leading-relaxed">
                Supercharge your cooking workflow. Scan screenshots instantly, parse structures via Gemini, scale ingredients, and join a smart cooking hub.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="font-display font-semibold text-white text-sm tracking-wider uppercase mb-4">Product</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/#features" className="hover:text-brand-400 transition-colors">Features</Link></li>
                <li><Link href="/#download" className="hover:text-brand-400 transition-colors">Download Android App</Link></li>
                <li><Link href="/community" className="hover:text-brand-400 transition-colors">Community Feed</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-display font-semibold text-white text-sm tracking-wider uppercase mb-4">Legal & Admin</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login" className="hover:text-brand-400 transition-colors">Admin Dashboard Login</Link></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-display font-semibold text-white text-sm tracking-wider uppercase mb-4">Contact</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="mailto:support@recipebook.com" className="hover:text-brand-400 transition-colors">support@recipebook.com</a></li>
                <li className="text-xs">Built with elite Node/React/Kotlin and Gemini integration.</li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-neutral-800 text-center text-xs">
            &copy; {new Date().getFullYear()} RecipeBook. All rights reserved. Designed for stunning visual excellence.
          </div>
        </footer>
      </body>
    </html>
  );
}
