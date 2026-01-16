
// src/app/login/page.tsx
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
    <div className="w-full max-w-md mx-auto mt-16">
      <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {error && <div className="p-4 rounded bg-red-50 text-red-500">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border rounded"
        />
        <button disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link href="/auth/register" className="text-indigo-600">
          Sign up
        </Link>
      </p>
    </div>
  );
}
