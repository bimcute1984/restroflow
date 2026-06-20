"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/theme-context";
import { useI18n } from "@/lib/i18n-context";
import { DEFAULT_ROUTE } from "@/lib/permissions";
import { LOCALE_FLAGS, type Locale } from "@/lib/i18n/translations";
import type { UserRole } from "@/types";

const locales: Locale[] = ["th", "en", "ja", "ko"];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? t.login.invalidCredentials
          : authError.message
      );
      setLoading(false);
      return;
    }

    const role = (data.user?.user_metadata?.role as UserRole) ?? "front";
    router.push(DEFAULT_ROUTE[role]);
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4 page-bg relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex gap-1">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              style={locale === l ? { background: "var(--blue-bg)", border: "1px solid var(--blue-border)" } : { background: "var(--bg-card)", border: "1px solid var(--border)" }}
              className="w-8 h-8 rounded-lg text-sm transition-all flex items-center justify-center"
            >
              {LOCALE_FLAGS[l]}
            </button>
          ))}
        </div>
        <button
          onClick={toggle}
          className="text-2xl"
          style={{ color: "var(--text-muted)" }}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🍽️</div>
          <h1
            style={{ color: "var(--text-primary)" }}
            className="text-3xl font-bold"
          >
            restro<span style={{ color: "var(--blue)" }}>flow</span>
          </h1>
          <p style={{ color: "var(--text-muted)" }} className="text-sm mt-2">
            {t.login.subtitle}
          </p>
        </div>

        <form onSubmit={handleLogin} className="card-glass p-6 flex flex-col gap-4">
          <h2
            style={{ color: "var(--text-primary)" }}
            className="text-lg font-bold text-center"
          >
            {t.login.title}
          </h2>

          {error && (
            <div
              style={{
                background: "var(--red-bg)",
                border: "1px solid var(--red-border)",
                color: "var(--red)",
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-center"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">
              {t.login.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoFocus
              className="input-styled w-full py-2.5"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">
              {t.login.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-styled w-full py-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={
              !loading && email && password
                ? { background: "var(--blue-grad)", color: "#fff", boxShadow: "0 4px 16px var(--blue-border)" }
                : { background: "var(--border)", color: "var(--text-dim)" }
            }
            className="w-full py-3 rounded-xl font-bold text-sm transition-all mt-2"
          >
            {loading ? t.login.loggingIn : t.login.loginBtn}
          </button>
        </form>

        <p style={{ color: "var(--text-dim)" }} className="text-xs text-center mt-6">
          Restroflow v1.0 · {t.login.appDesc}
        </p>
      </div>
    </div>
  );
}
