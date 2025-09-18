import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About EmpathAI - Your Empathetic AI Companion",
  description: "Learn about EmpathAI's mission to provide accessible, empathetic AI companionship. Discover our privacy-focused approach to mental health support and emotional intelligence.",
  keywords: "about EmpathAI, AI companion story, empathetic AI mission, mental health AI, emotional support technology",
  openGraph: {
    title: "About EmpathAI - Your Empathetic AI Companion",
    description: "Learn about EmpathAI's mission to provide accessible, empathetic AI companionship with privacy-focused emotional support.",
    siteName: "EmpathAI",
  },
  twitter: {
    title: "About EmpathAI - Your Empathetic AI Companion",
    description: "Learn about EmpathAI's mission to provide accessible, empathetic AI companionship.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
