
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FlaskConical } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Laboratory Result — Staff Portal",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StaffLabResultPage({
  params,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (
    session.user.role !== "STAFF" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }

  const { id } = await params;

  /*
   * TEMPORARY DEMO RESULT
   *
   * This will eventually be replaced by the laboratory
   * result coming from the external laboratory system.
   */
  const result = {
    id,
    laboratoryNo: "LAB-2026-00125",
    patientName: "Juan Dela Cruz",
    testName: "Complete Blood Count (CBC)",
    dateReleased: "August 15, 2026",
    status: "READY",
    specimen: "Whole Blood",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href="/staff/lab-results"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-clinical-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Laboratory Results
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-clinical-950">
          Laboratory Result
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View the complete laboratory result and patient information.
        </p>
      </div>

      {/* Result Card */}
      <Card className="overflow-hidden">
        {/* Result Header */}
        <div className="border-b border-slate-100 bg-clinical-50/50 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-clinical-600 shadow-sm">
                <FlaskConical
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-clinical-950">
                  {result.testName}
                </h2>

                <p className="text-sm text-slate-500">
                  Laboratory Result
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              Ready
            </span>
          </div>
        </div>

        {/* Patient Information */}
        <div className="border-b border-slate-100 p-6">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Patient Information
          </h3>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Patient
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {result.patientName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Laboratory No.
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {result.laboratoryNo}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Date Released
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {result.dateReleased}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Specimen
              </p>

              <p className="mt-1 font-medium text-slate-700">
                {result.specimen}
              </p>
            </div>
          </div>
        </div>

        {/* CBC Results */}
        <div className="p-6">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
            Test Results
          </h3>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
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
              Results are within the expected reference range.
              Please consult the attending physician for clinical
              interpretation of these results.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/api/lab-results/${result.laboratoryNo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </a>

            <Link href="/staff/lab-results">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Results
              </Button>
            </Link>
          </div>

          {/* Demo Notice */}
          <p className="mt-5 text-xs text-slate-400">
            Demo laboratory result shown for presentation purposes
            while the external laboratory system is not yet connected.
          </p>
        </div>
      </Card>
    </div>
  );
}

