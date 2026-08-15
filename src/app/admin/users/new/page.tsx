"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function CreateAccountPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          age,
          gender,
          email,
          contactNumber,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to create account.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);

      setFullName("");
      setAge("");
      setGender("PREFER_NOT_TO_SAY");
      setEmail("");
      setContactNumber("");
      setPassword("");
      setRole("STAFF");

      setIsSubmitting(false);

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-clinical-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </button>

        <h1 className="font-display text-2xl font-bold text-clinical-950">
          Create Account
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a Staff or Administrator account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
            Account created successfully.
          </div>
        )}

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>

          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-slate-700"
            >
              Age
            </label>

            <input
              id="age"
              type="number"
              min={1}
              max={120}
              required
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
            />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-slate-700"
            >
              Gender
            </label>

            <select
              id="gender"
              required
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">
                Prefer not to say
              </option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
          />
        </div>

        <div>
          <label
            htmlFor="contactNumber"
            className="block text-sm font-medium text-slate-700"
          >
            Contact Number
          </label>

          <input
            id="contactNumber"
            type="tel"
            value={contactNumber}
            onChange={(event) => setContactNumber(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
          />

          <p className="mt-1.5 text-xs text-slate-500">
            Password must be at least 8 characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-slate-700"
          >
            Account Type
          </label>

          <select
            id="role"
            required
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "STAFF" | "ADMIN")
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
          >
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-clinical-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />

            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}