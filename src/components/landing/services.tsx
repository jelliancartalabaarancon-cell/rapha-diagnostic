import { getActiveServices } from "@/lib/data/services";
import { getServiceIcon } from "@/lib/icon-map";

export async function Services() {
  const services = await getActiveServices();

  return (
    <section id="services" className="bg-clinical-50/50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">
            Our Services
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-clinical-950 sm:text-4xl">
            Diagnostic testing, in one place
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            From routine screening to imaging and cardiac workups — book any
            of these directly through your patient portal.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = getServiceIcon(service.icon);
            return (
              <div
                key={service.id}
                className="group rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-clinical-100 hover:shadow-[0_12px_32px_-16px_rgba(15,44,76,0.18)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-clinical-50 text-clinical-600 transition-colors group-hover:bg-clinical-600 group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold text-clinical-950">
                  {service.name}
                </h3>
                <p className="mt-1.5 text-[0.83rem] leading-relaxed text-slate-500">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
