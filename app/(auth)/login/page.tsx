"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiLogin, saveAuth, getCurrentUser } from "../../(_lib)/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // kalau dah login, terus masuk dashboard
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await apiLogin({ email, password });
      saveAuth(data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login gagal. Sila cuba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">
          Employee Document Portal
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Sila login menggunakan akaun AK Optima anda.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="admin@akoptima.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Hint: gunakan user seeder (contoh: admin@akoptima.com / password)
        </p>
      </div>
    </div>
  );
}