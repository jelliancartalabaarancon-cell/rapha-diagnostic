
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

type ServiceData = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
};

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();

  const serviceId = params.id as string;

  const [service, setService] =
    useState<ServiceData | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [icon, setIcon] = useState("");

  const [isLoading, setIsLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);
  const [success, setSuccess] =
    useState(false);

  /*
   * Load service
   */
  useEffect(() => {
    async function loadService() {
      try {
        const response = await fetch(
          `/api/staff/services/${serviceId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ??
              "Unable to load service.",
          );
          return;
        }

        const currentService =
          data.service as ServiceData;

        setService(currentService);

        setName(currentService.name);
        setDescription(
          currentService.description,
        );
        setIcon(currentService.icon);
      } catch {
        setError(
          "Something went wrong while loading the service.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  /*
   * Save changes
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

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
        `/api/staff/services/${serviceId}`,
        {
          method: "PATCH",
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
            "Unable to update service.",
        );
        return;
      }

      setService(data.service);
      setSuccess(true);

      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading service...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Service not found
   */
  if (!service) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button
          type="button"
          onClick={() =>
            router.push("/staff/services")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-clinical-700"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Services
        </button>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">
            {error ?? "Service not found."}
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
          onClick={() =>
            router.push("/staff/services")
          }
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-clinical-700"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Services
        </button>

        <h1 className="font-display text-2xl font-bold text-clinical-950">
          Edit Laboratory Service
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the laboratory service information.
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

        {/* Success */}
        {success && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
            Service updated successfully.
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
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100 disabled:opacity-60"
          />

          <p className="mt-1.5 text-xs text-slate-500">
            Example: 🩸, ❤️, 🧪, or 🩺
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

