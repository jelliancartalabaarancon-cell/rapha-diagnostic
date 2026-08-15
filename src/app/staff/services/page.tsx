
import {
  getAllServices,
} from "@/lib/data/services";
import { ServiceActions } from "@/components/staff/service-actions";
import Link from "next/link";

export default async function ServicesPage() {
  const services = await getAllServices();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>

            <Link
      href="/admin"
      className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-clinical-700"
    >
      ← Back to the Dashboard
    </Link>


          <h1 className="font-display text-2xl font-bold text-clinical-950">
            Laboratory Services
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage laboratory services available to patients.
          </p>
        </div>

        <a
          href="/staff/services/new"
          className="rounded-xl bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
        >
          Create Service
        </a>
      </div>

      {/* Services */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3 font-medium">
                  Service
                </th>

                <th className="px-4 py-3 font-medium">
                  Description
                </th>

                <th className="px-4 py-3 font-medium">
                  Icon
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="px-4 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  {/* Service */}
                  <td className="px-4 py-4">
                    <div className="font-semibold text-clinical-950">
                      {service.name}
                    </div>
                  </td>

                  {/* Description */}
                  <td className="max-w-md px-4 py-4 text-slate-600">
                    <p className="line-clamp-2">
                      {service.description}
                    </p>
                  </td>

                  {/* Icon */}
                  <td className="px-4 py-4 text-slate-600">
                    {service.icon}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {service.isActive ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <ServiceActions
                      id={service.id}
                      isActive={service.isActive}
                    />
                  </td>
                </tr>
              ))}

              {services.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No laboratory services have been created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
