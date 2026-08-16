
import type { Metadata } from "next";
import Link from "next/link";
import {
  Download,
  FileSearch,
  FlaskConical,
  Eye,
} from "lucide-react";
import { auth } from "@/auth";
import { getLabResultsByUser } from "@/lib/data/lab-results";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Laboratory Results — RAPHA Patient Portal",
};

export default async function LabResultsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const results = await getLabResultsByUser(session.user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-clinical-950">
          Laboratory Results
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your laboratory test results and reports.
        </p>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No laboratory results available."
          description="When a laboratory test is completed and released, your result will appear here."
        />
      ) : (
        <Card className="overflow-hidden">
          {/* Card Header */}
          <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clinical-50 text-clinical-600">
                <FlaskConical
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h2 className="font-display text-sm font-semibold text-clinical-950">
                  Your Laboratory Results
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Results released by the laboratory will appear here.
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="divide-y divide-slate-100">
            {results.map((result) => {
              const isReady = result.status === "READY";

              return (
                <div
                  key={result.id}
                  className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Result Information */}
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clinical-50 text-clinical-600">
                      <FlaskConical
                        className="h-5 w-5"
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="font-display font-semibold text-clinical-950">
                        {result.testName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Date Released:{" "}
                        {result.dateReleased
                          ? formatDisplayDate(result.dateReleased)
                          : "Pending"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Laboratory Result ID: {result.id}
                      </p>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span
                      className={
                        isReady
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"
                          : "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200"
                      }
                    >
                      {isReady ? "Ready" : "Pending"}
                    </span>

                    {isReady ? (
                      <>
                        {/* View Result */}
                        <Link
                          href={`/dashboard/results/${result.id}`}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                            View Result
                          </Button>
                        </Link>

                        {/* Download PDF */}
                        <a
                          href={`/api/lab-results/${result.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                        </a>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                      >
                        Result Pending
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Demo Notice */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
            <p className="text-xs leading-5 text-slate-400">
              Demo laboratory result shown for presentation purposes
              while the external laboratory system is not yet connected.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

