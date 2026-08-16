
import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Laboratory Results — RAPHA Staff",
};

const DEMO_RESULTS = [
  {
    id: "LAB-2026-00125",
    patient: "Juan Dela Cruz",
    email: "juan@example.com",
    test: "Complete Blood Count (CBC)",
    date: "August 15, 2026",
    status: "READY",
  },
  {
    id: "LAB-2026-00124",
    patient: "Maria Santos",
    email: "maria@example.com",
    test: "Fasting Blood Sugar",
    date: "August 15, 2026",
    status: "READY",
  },
  {
    id: "LAB-2026-00123",
    patient: "Pedro Garcia",
    email: "pedro@example.com",
    test: "Lipid Profile",
    date: "August 14, 2026",
    status: "PENDING",
  },
];

export default function StaffLabResultsPage() {
  const totalResults = DEMO_RESULTS.length;

  const releasedResults = DEMO_RESULTS.filter(
    (result) => result.status === "READY"
  ).length;

  const pendingResults = DEMO_RESULTS.filter(
    (result) => result.status === "PENDING"
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-clinical-950">
          Laboratory Results
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage patient laboratory results.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">
            Total Results
          </p>

          <p className="mt-2 font-display text-2xl font-bold text-clinical-950">
            {totalResults}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">
            Released
          </p>

          <p className="mt-2 font-display text-2xl font-bold text-emerald-600">
            {releasedResults}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">
            Pending
          </p>

          <p className="mt-2 font-display text-2xl font-bold text-amber-600">
            {pendingResults}
          </p>
        </Card>
      </div>

      {/* Results */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clinical-50 text-clinical-600">
              <FlaskConical className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-clinical-950">
                Patient Laboratory Results
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Laboratory results received from the laboratory system.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-white text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Laboratory No.
                </th>

                <th className="px-6 py-4 font-semibold">
                  Patient
                </th>

                <th className="px-6 py-4 font-semibold">
                  Test
                </th>

                <th className="px-6 py-4 font-semibold">
                  Date
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 font-semibold text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {DEMO_RESULTS.map((result) => (
                <tr
                  key={result.id}
                  className="transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-6 py-5 font-medium text-clinical-950">
                    {result.id}
                  </td>

                  <td className="px-6 py-5">
                    <p className="font-medium text-slate-700">
                      {result.patient}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {result.email}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {result.test}
                  </td>

                  <td className="px-6 py-5 text-slate-500">
                    {result.date}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={
                        result.status === "READY"
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"
                          : "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200"
                      }
                    >
                      {result.status === "READY"
                        ? "Released"
                        : "Pending"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    {result.status === "READY" ? (
                      <Link
                        href={`/staff/lab-results/${result.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-clinical-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-clinical-700"
                      >
                        <Eye className="h-4 w-4" />
                        View Result
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-400"
                      >
                        <Eye className="h-4 w-4" />
                        View Result
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Demo Notice */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <p className="text-xs text-slate-400">
            Demo laboratory data shown for presentation purposes.
            This section will receive actual results when the external
            laboratory system is integrated.
          </p>
        </div>
      </Card>
    </div>
  );
}

