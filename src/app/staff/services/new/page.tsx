
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

export default function CreateServicePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const [error, setError] = useState<string | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError("Please enter the service name.");
      return;
    }

    if (!description.trim()) {
      setError(
        "Please enter the service description.",
      );
      return;
    }

    if (!icon.trim()) {
      setError("Please enter an icon.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/staff/services",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            icon: icon.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to create service.",
        );
        return;
      }

      router.push("/staff/services");
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            router.push("/staff/services")
          }
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-clinical-700"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Services
        </button>

        <h1 className="font-display text-2xl font-bold text-clinical-950">
          Create Laboratory Service
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new laboratory service that can be
          offered to patients.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-100">
            {error}
          </div>
        )}

        {/* Service Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Service Name
          </label>

          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="Example: Complete Blood Count"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="description"
            required
            rows={5}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="Describe what this laboratory service is for."
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
          />
        </div>

        {/* Icon */}
        <div>
          <label
            htmlFor="icon"
            className="block text-sm font-medium text-slate-700"
          >
            Icon
          </label>

          <input
            id="icon"
            type="text"
            required
            value={icon}
            onChange={(event) =>
              setIcon(event.target.value)
            }
            disabled={isSubmitting}
            placeholder="Example: 🩸"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
          />

          <p className="mt-1.5 text-xs text-slate-500">
            You can use an emoji such as 🩸, ❤️, 🧪,
            or 🩺.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/staff/services")
            }
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-clinical-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />

            {isSubmitting
              ? "Creating..."
              : "Create Service"}
          </button>
        </div>
      </form>
    </div>
  );
}
