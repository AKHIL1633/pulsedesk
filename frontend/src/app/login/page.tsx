"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login } from "@/controllers/auth";
import { ApiError } from "@/models/api";
import { Logo } from "@/views/Logo";
import { IMAGES } from "@/views/images";

const DEMO_EMAIL = "reviewer@pulsedesk.dev";
const DEMO_PASSWORD = "pulsedesk-demo";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-pulse-500 focus:outline-none focus:ring-4 focus:ring-pulse-100";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to log in");
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  return (
    // Break out of the layout's centered <main> for a full-bleed split screen.
    <div className="fixed inset-0 grid overflow-y-auto bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={IMAGES.loginHero}
          alt="Support team working at their desks"
          fill
          priority
          sizes="50vw"
          className="animate-slow-zoom object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pulse-900/90 via-pulse-700/70 to-teal-600/60" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo inverted />
          <div className="max-w-md animate-fade-in-up space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Let AI do the triage.
              <br />
              <span className="text-pulse-100">You make the call.</span>
            </h2>
            <ul className="space-y-3 text-sm text-white/85">
              {[
                "Every ticket classified and prioritised in seconds",
                "Draft replies ready for your review",
                "Low-confidence calls flagged for a closer look",
              ].map((line, i) => (
                <li
                  key={line}
                  className="flex animate-fade-in-up items-center gap-3"
                  style={{ animationDelay: `${200 + i * 120}ms` }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/60">Photo via Unsplash</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to review today&apos;s tickets.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto h-7 rounded-md px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="animate-fade-in-up rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-pulse-gradient px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-pulse-500/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pulse-500/30 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            className="mt-6 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-left text-xs text-slate-500 transition hover:border-pulse-400 hover:bg-pulse-50"
          >
            <span className="font-semibold text-slate-700">Demo account</span> — click to fill{" "}
            <span className="font-mono">{DEMO_EMAIL}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
