"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { THEMES, ThemeId } from "@/constants/themes";

export default function LoginForm() {
  const router = useRouter();

  const [themeId, setThemeId] = useState<ThemeId>("purple");
  const theme = THEMES[themeId];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("onlyus-theme") as ThemeId | null;

    if (savedTheme && THEMES[savedTheme]) {
      setThemeId(savedTheme);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/chat");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${theme.background} px-4`}
    >
      <div className="w-full max-w-md rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-8 text-center">
          {/* OnlyUs 💕 */}
          <h1 className={`text-4xl font-bold ${theme.text}`}>Chat App</h1>
          <p className="mt-2 text-gray-600">
            A private little space for us.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              className={`w-full rounded-xl border ${theme.border} px-4 py-3 outline-none focus:border-purple-500`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full rounded-xl border ${theme.border} px-4 py-3 pr-20 outline-none focus:border-purple-500`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl ${theme.primary} ${theme.primaryHover} py-3 font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}