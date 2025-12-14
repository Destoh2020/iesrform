"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { applicationsApi } from "@/lib/api";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Store password temporarily to test connection
    sessionStorage.setItem("adminPassword", password);

    try {
      // Try to fetch applications to verify password
      await applicationsApi.getAll();
      router.push("/admin");
    } catch {
      setError("Invalid password");
      sessionStorage.removeItem("adminPassword");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600">Enter password to access dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-center text-lg tracking-widest"
                placeholder="••••••••"
                required
                autoFocus
              />
              {error && <p className="error-text text-center mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg"
            >
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Back to Application Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
