"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { PublicUser } from "@/types";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
 const [fullName, setFullName] = useState(user.fullName ?? "");
const [age, setAge] = useState(String(user.age ?? ""));
const [gender, setGender] = useState(user.gender ?? "PREFER_NOT_TO_SAY");
const [contactNumber, setContactNumber] = useState(user.contactNumber ?? "");
const [email, setEmail] = useState(user.email ?? "");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, age, gender, contactNumber, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not save your changes.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
          Profile updated successfully.
        </div>
      )}

      <Field label="Full Name" htmlFor="fullName">
        <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Age" htmlFor="age">
          <Input
            id="age"
            type="number"
            min={1}
            max={120}
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </Field>
        <Field label="Gender" htmlFor="gender">
          <Select id="gender" required value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </Select>
        </Field>
      </div>

      <Field label="Contact Number" htmlFor="contactNumber" optional>
        <Input
          id="contactNumber"
          type="tel"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
        />
      </Field>

      <Field label="Email Address" htmlFor="email">
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : (
          <>
            <Save className="h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  );
}
