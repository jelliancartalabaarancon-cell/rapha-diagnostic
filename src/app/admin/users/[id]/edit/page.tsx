"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

type UserData = {
  id: string;
  fullName: string;
  age: number;
  gender:
    | "MALE"
    | "FEMALE"
    | "OTHER"
    | "PREFER_NOT_TO_SAY";
  email: string;
  role: "STAFF" | "ADMIN";
  contactNumber?: string | null;
};

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();

  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] =
    useState<UserData["gender"]>("PREFER_NOT_TO_SAY");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [role, setRole] =
    useState<"STAFF" | "ADMIN">("STAFF");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /*
   * Load the account.
   */
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(
          `/api/admin/users/${userId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ?? "Unable to load account.",
          );
          return;
        }

        const account = data.user as UserData;

        setUser(account);

        setFullName(account.fullName);
        setAge(String(account.age));
        setGender(account.gender);
        setEmail(account.email);
        setContactNumber(
          account.contactNumber ?? "",
        );
        setRole(account.role);
      } catch {
        setError(
          "Something went wrong while loading the account.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  /*
   * Submit changes.
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    const numericAge = Number(age);

    if (!fullName.trim()) {
      setError("Please enter the full name.");
      return;
    }

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      setError("Age must be between 1 and 120.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            age: numericAge,
            gender,
            email: email.trim(),
            contactNumber: contactNumber.trim(),
            role,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Unable to update account.",
        );
        return;
      }

      setUser(data.user);
      setSuccess(true);

      /*
       * Refresh the Admin dashboard data.
       */
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading account...
          </p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-clinical-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </button>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
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
          Edit Account
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update Staff or Administrator account
          information.
        </p>
      </div>

      {/* Form */}
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
            Account updated successfully.
          </div>
        )}

        {/* Full Name */}
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
            onChange={(event) =>
              setFullName(event.target.value)
            }
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
          />
        </div>

        {/* Age + Gender */}
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
              onChange={(event) =>
                setAge(event.target.value)
              }
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
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
              onChange={(event) =>
                setGender(
                  event.target
                    .value as UserData["gender"],
                )
              }
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
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

        {/* Email */}
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
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
          />
        </div>

        {/* Contact Number */}
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
            onChange={(event) =>
              setContactNumber(event.target.value)
            }
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
          />
        </div>

        {/* Role */}
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
              setRole(
                event.target.value as
                  | "STAFF"
                  | "ADMIN",
              )
            }
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
          >
            <option value="STAFF">Staff</option>
            <option value="ADMIN">
              Administrator
            </option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-clinical-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />

            {isSubmitting
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}