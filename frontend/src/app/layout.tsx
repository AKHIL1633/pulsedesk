import type { Metadata } from "next";
import { Header } from "@/views/Header";
import { Toaster } from "@/views/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseDesk — AI-triaged support, human-reviewed.",
  description: "AI ticket triage agent with human-in-the-loop review.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
