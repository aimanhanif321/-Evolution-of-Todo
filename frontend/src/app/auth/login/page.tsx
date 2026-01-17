"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import APIClient from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await APIClient.post<{ access_token: string }>("/api/auth/login", {
        email,
        password,
      });
      const token = res.access_token;

      // Decode token for user info (if available)
      let user = { id: "unknown", email, name: "User" };
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        user = {
          id: payload.sub || payload.user_id || "unknown",
          email: payload.email || email,
          name: payload.name || "User",
        };
      } catch {}

      login(token, user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back</h2>
      <p className="text-slate-500 mt-2 text-sm sm:text-base">Sign in to continue to Taskora</p>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-6">
        {error && (
          <div className="p-3 sm:p-4 rounded-lg bg-red-50 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-base"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-base"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors text-base"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-indigo-600 font-medium hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </div>
  );
}
