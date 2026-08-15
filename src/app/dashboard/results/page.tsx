import type { Metadata } from "next";
import { FileSearch } from "lucide-react";
import { auth } from "@/auth";
import { getLabResultsByUser } from "@/lib/data/lab-results";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Laboratory Results — RAPHA Patient Portal" };

export default async function LabResultsPage() {
  const session = await auth();
  const results = await getLabResultsByUser(session!.user.id);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-clinical-950">Laboratory Results</h1>
      <p className="mt-1 text-sm text-slate-500">
        Released results will appear here as soon as they&apos;re ready.
      </p>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No laboratory results available."
            description="When a test you booked is completed and reviewed, it will show up in this list with an option to view or download it."
          />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Test Name</th>
                  <th className="px-5 py-3 font-semibold">Date Released</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-5 py-4 font-medium text-slate-700">{result.testName}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {result.dateReleased ? formatDisplayDate(result.dateReleased) : "Pending"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          result.status === "READY"
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"
                            : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200"
                        }
                      >
                        {result.status === "READY" ? "Ready" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" disabled={result.status !== "READY"}>
                          View Result
                        </Button>
                        <Button variant="ghost" size="sm" disabled={result.status !== "READY"}>
                          Download PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
