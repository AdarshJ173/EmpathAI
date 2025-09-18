import { TempoInit } from "@/components/tempo-init";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EmpathAI - Your Empathetic AI Companion",
  description: "EmpathAI is your personal empathetic AI companion that understands, supports, and grows with you. Experience meaningful conversations with advanced emotional intelligence.",
  keywords: "AI companion, empathetic AI, emotional support, mental health, AI chat, artificial intelligence, personal assistant",
  authors: [{ name: "EmpathAI Team" }],
  creator: "EmpathAI",
  publisher: "EmpathAI",
  applicationName: "EmpathAI",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "EmpathAI - Your Empathetic AI Companion",
    description: "Experience meaningful conversations with your personal empathetic AI companion. EmpathAI understands, supports, and grows with you.",
    siteName: "EmpathAI",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EmpathAI - Your Empathetic AI Companion",
    description: "Experience meaningful conversations with your personal empathetic AI companion.",
    creator: "@EmpathAI",
  },
  icons: {
    icon: [
      {
        url: "/EmpathAI.png",
        sizes: "any",
        type: "image/png",
      },
    ],
    shortcut: "/EmpathAI.png",
    apple: [
      {
        url: "/EmpathAI.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/EmpathAI.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/EmpathAI.png" />
        <meta name="application-name" content="EmpathAI" />
        <meta name="apple-mobile-web-app-title" content="EmpathAI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
      </head>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#0f0f0f',
              colorInputBackground: '#1a1a1a',
              colorInputText: '#ffffff',
              colorText: '#ffffff',
              colorNeutral: '#ffffff',
              borderRadius: '0.5rem',
            },
            elements: {
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
              card: 'bg-slate-900 border-slate-700',
              headerTitle: 'text-white',
              headerSubtitle: 'text-slate-300',
              socialButtonsBlockButton: 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-white',
              formFieldInput: 'bg-slate-800 border-slate-600 text-white',
              formFieldLabel: 'text-slate-300',
              footerActionLink: 'text-indigo-400 hover:text-indigo-300',
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <TempoInit />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
