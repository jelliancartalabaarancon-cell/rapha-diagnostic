import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { auth } from "@/auth";
import { getLabResultById } from "@/lib/data/lab-results";
import { Card } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Laboratory Result — RAPHA Patient Portal",
};

type LabResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LabResultPage({
  params,
}: LabResultPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { id } = await params;

  const result = await getLabResultById(id, session.user.id);

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/results"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-clinical-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Link>

        <Card className="mt-6 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FlaskConical className="h-6 w-6" />
          </div>

          <h1 className="mt-4 font-display text-xl font-semibold text-clinical-950">
            Laboratory Result Not Found
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            The laboratory result you are looking for could not be found.
            It may no longer be available or may not belong to your account.
          </p>

          <Link
            href="/dashboard/results"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-clinical-700"
          >
            Back to Laboratory Results
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Back */}
      <div>
        <Link
          href="/dashboard/results"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-clinical-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-clinical-50 text-clinical-600">
            <FlaskConical className="h-6 w-6" strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-clinical-950">
              {result.testName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Laboratory Test Result
            </p>
          </div>
        </div>
      </div>

      {/* Result Information */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-clinical-50/50 px-6 py-5">
          <h2 className="font-display text-lg font-semibold text-clinical-950">
            Result Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Information about your laboratory examination.
          </p>
        </div>

        <div className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Laboratory No.
              </p>

              <p className="mt-1 font-medium text-slate-700">
                LAB-2026-00125
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Test Name
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {result.testName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Status
              </p>

              <div className="mt-1">
                <span
                  className={
                    result.status === "READY"
                      ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"
                      : "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200"
                  }
                >
                  {result.status === "READY" ? "Ready" : "Pending"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Date Released
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {result.dateReleased
                  ? formatDisplayDate(result.dateReleased)
                  : "Pending"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Specimen
              </p>

              <p className="mt-1 font-medium text-slate-700">
                Whole Blood
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Laboratory Results */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">
          <h2 className="font-display text-lg font-semibold text-clinical-950">
            Laboratory Results
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed values from your laboratory examination.
          </p>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Test
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Result
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Unit
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Reference Range
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 text-slate-700">
                    Hemoglobin
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-800">
                    14.2
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    g/dL
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    13.5 – 17.5
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 text-slate-700">
                    White Blood Cell Count
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-800">
                    7.8
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    ×10⁹/L
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    4.0 – 11.0
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 text-slate-700">
                    Platelet Count
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-800">
                    265
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    ×10⁹/L
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    150 – 450
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 text-slate-700">
                    Hematocrit
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-800">
                    42.1
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    %
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    41 – 53
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Laboratory Remarks
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Results are within the expected reference range. Please
              consult your physician for clinical interpretation of these
              results.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {result.fileUrl ? (
              <>
                <a
                  href={result.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-clinical-700"
                >
                  View Result
                </a>

                <a
                  href={result.fileUrl}
                  download
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Download PDF
                </a>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
                >
                  View Result
                </button>

                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-slate-400"
                >
                  Download PDF
                </button>
              </>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Demo laboratory result shown for presentation purposes while
            the external laboratory system is not yet connected.
          </p>
        </div>
      </Card>
    </div>
  );
}