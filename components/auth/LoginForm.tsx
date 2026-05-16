"use client";

import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { THEMES, ThemeId, DEFAULT_THEME_ID } from "@/constants/themes";
import { createOrUpdateUserProfile } from "@/lib/userService";

export default function LoginForm() {
  const router = useRouter();

  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID)
  const theme = THEMES[themeId];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createOrUpdateUserProfile(userCredential.user);

      router.push("/chat");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const provider = new GoogleAuthProvider();

      const userCredential = await signInWithPopup(auth, provider);

      await createOrUpdateUserProfile(userCredential.user);

      router.push("/chat");
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset link has been sent to your email.");
    } catch (err) {
      setError("Unable to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${theme.background} px-4`}
    >
      <div className="w-full max-w-md rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-8 text-center">
          <h1 className={`text-4xl font-bold ${theme.text}`}>PritAbhi 💕</h1>
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
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className={`text-sm font-medium ${theme.text} hover:underline disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>

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

          {successMessage && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
              {successMessage}
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

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg">G</span>
          {googleLoading ? "Signing in..." : "Login with Gmail"}
        </button>
      </div>
    </div>
  );
}