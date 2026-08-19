"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to reset your password.",
        );
        return;
      }

      setMessage(
        data.message ||
          "Your password has been reset successfully.",
      );

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password reset error:", error);

      setError(
        "Unable to connect to the server. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Reset password form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* New password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              New Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter new password"
              disabled={loading}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm new password"
              disabled={loading}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </div>

          {/* Password requirements */}
          <p className="text-xs text-gray-500">
            Password must be at least 8 characters long.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Back to Login
          </a>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Loading password reset...
            </p>
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}