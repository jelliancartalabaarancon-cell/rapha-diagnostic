
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import Link from "next/link";

type PageProps = {
  params: Promise<{
    laboratoryNo: string;
  }>;
};

export default async function VerifyResultPage({
  params,
}: PageProps) {
  const { laboratoryNo } = await params;

  /*
   * Find the verification record registered when
   * the PDF was generated.
   */
  const verification =
    await prisma.labResultVerification.findUnique({
      where: {
        laboratoryNo,
      },
    });

  /*
   * No verification record exists.
   */
  if (!verification) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl text-red-600">!</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Verification Failed
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            This laboratory result could not be verified in
            the RAPHA Diagnostic Laboratory system.
          </p>

          <p className="mt-4 text-sm font-medium text-gray-700">
            Laboratory No.: {laboratoryNo}
          </p>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to RAPHA
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * IMPORTANT
   * --------------------------------------------------
   *
   * This demo uses the same laboratory result data
   * as the PDF API.
   *
   * Later, this should come from the actual LabResult
   * database record.
   */
  const result = {
    laboratoryNo,
    patientName: "Juan Dela Cruz",
    testName: "Complete Blood Count (CBC)",
    dateReleased: "August 15, 2026",
    status: "READY",
    specimen: "Whole Blood",
    remarks:
      "Results are within the expected reference range. Please consult the attending physician for clinical interpretation of these results.",
    items: [
      {
        test: "Hemoglobin",
        result: "14.2",
        unit: "g/dL",
        referenceRange: "13.5 - 17.5",
      },
      {
        test: "White Blood Cell Count",
        result: "7.8",
        unit: "x10^9/L",
        referenceRange: "4.0 - 11.0",
      },
      {
        test: "Platelet Count",
        result: "265",
        unit: "x10^9/L",
        referenceRange: "150 - 450",
      },
      {
        test: "Hematocrit",
        result: "42.1",
        unit: "%",
        referenceRange: "41 - 53",
      },
    ],
  };

  /*
   * Create the exact same data representation
   * that was hashed when the PDF was generated.
   */
  const verificationData = JSON.stringify({
    laboratoryNo: result.laboratoryNo,
    patientName: result.patientName,
    testName: result.testName,
    dateReleased: result.dateReleased,
    status: result.status,
    specimen: result.specimen,
    items: result.items,
    remarks: result.remarks,
  });

  /*
   * Calculate the current hash.
   */
  const currentHash = crypto
    .createHash("sha256")
    .update(verificationData)
    .digest("hex");

  /*
   * Compare the current result against the
   * hash registered when the PDF was generated.
   */
  const isVerified =
    currentHash === verification.documentHash;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              RAPHA DIAGNOSTIC LABORATORY
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Laboratory Result Verification
            </p>
          </div>

          <div className="p-6">
            {/* Verification status */}
            {isVerified ? (
              <div className="rounded-xl bg-green-50 p-5 text-center ring-1 ring-inset ring-green-200">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <span className="text-3xl font-bold text-green-600">
                    ✓
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold text-green-800">
                  Laboratory Result Verified
                </h2>

                <p className="mt-2 text-sm text-green-700">
                  This laboratory result matches the record
                  registered in the RAPHA system.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-red-50 p-5 text-center ring-1 ring-inset ring-red-200">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <span className="text-3xl font-bold text-red-600">
                    !
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold text-red-800">
                  Verification Failed
                </h2>

                <p className="mt-2 text-sm text-red-700">
                  The laboratory result information does not
                  match the registered RAPHA record.
                </p>
              </div>
            )}

            {/* Result information */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900">
                Laboratory Result
              </h2>

              <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
                <div className="flex justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Laboratory No.
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-900">
                    {result.laboratoryNo}
                  </span>
                </div>

                <div className="flex justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Patient
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-900">
                    {result.patientName}
                  </span>
                </div>

                <div className="flex justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Test
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-900">
                    {result.testName}
                  </span>
                </div>

                <div className="flex justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Date Released
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-900">
                    {result.dateReleased}
                  </span>
                </div>

                <div className="flex justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Specimen
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-900">
                    {result.specimen}
                  </span>
                </div>

                <div className="flex justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Status
                  </span>

                  <span className="text-right text-sm font-semibold text-green-600">
                    Released
                  </span>
                </div>
              </div>
            </div>

            {/* Integrity */}
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Document Integrity
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {isVerified
                  ? "The result data matches the original record registered by RAPHA."
                  : "The result data does not match the original registered record."}
              </p>
            </div>

            {/* Back */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Back to RAPHA Diagnostic Laboratory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
