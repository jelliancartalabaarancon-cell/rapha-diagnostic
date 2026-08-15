"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

interface EditUserButtonProps {
  userId: string;
}

export function EditUserButton({
  userId,
}: EditUserButtonProps) {
  const router = useRouter();

  function handleEdit() {
    router.push(`/admin/users/${userId}/edit`);
  }

  return (
    <button
      type="button"
      onClick={handleEdit}
      className="inline-flex items-center gap-2 rounded-lg bg-clinical-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-clinical-700"
    >
      <Pencil className="h-4 w-4" />
      Edit
    </button>
  );
}