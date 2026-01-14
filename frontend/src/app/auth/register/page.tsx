"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import APIClient from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Register the user
      await APIClient.post("/api/auth/register", {
        name,
        email,
        password,
      });

      // ✅ Auto-login after registration
      const res = await APIClient.post<{ access_token: string }>(
        "/api/auth/login",
        { email, password }
      );

      const token = res.access_token;

      // Decode JWT to get user id
      let user = { id: "unknown", email, name };
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        user.id = payload.sub || payload.user_id || "unknown";
      } catch (e) {
        console.error("Failed to decode token", e);
      }

      // Save in AuthContext
      login(token, user);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Create an account</h2>
        <p className="text-slate-500 mt-2">
          Start organizing your life with Taskora.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-md bg-red-50 text-red-500 text-sm">{error}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-indigo-600 font-semibold hover:text-indigo-500"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
