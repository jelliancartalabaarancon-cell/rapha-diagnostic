import { CheckCircle2, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

const PANEL_ROWS = [
  { label: "Hemoglobin", value: "14.2 g/dL", range: "13.5–17.5", status: "normal" as const },
  { label: "WBC Count", value: "6.8 x10⁹/L", range: "4.0–11.0", status: "normal" as const },
  { label: "Platelets", value: "410 x10⁹/L", range: "150–450", status: "normal" as const },
  { label: "Fasting Glucose", value: "132 mg/dL", range: "70–100", status: "flag" as const },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-b from-clinical-50 via-clinical-50/40 to-transparent" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-clinical-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-clinical-700 ring-1 ring-inset ring-clinical-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            DOH-licensed diagnostic laboratory
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-clinical-950 sm:text-5xl">
            Every result, read twice.
            <br />
            Confirmed once.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600">
            RAPHA Diagnostic Laboratory runs your blood work, imaging, and
            cardiac screening with the same rigor every time — then puts it
            in a patient portal so you&apos;re never stuck waiting on a phone
            call to hear how you&apos;re doing.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/signup" size="lg">
              Book an Appointment
            </LinkButton>
            <LinkButton href="/#services" variant="secondary" size="lg">
              View Services
            </LinkButton>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-slate-100 pt-8">
            <div>
              <dt className="text-2xl font-bold text-clinical-950 font-display">15+</dt>
              <dd className="text-xs text-slate-500">Years serving Koronadal</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-clinical-950 font-display">24hr</dt>
              <dd className="text-xs text-slate-500">Typical result turnaround</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-clinical-950 font-display">8</dt>
              <dd className="text-xs text-slate-500">Core diagnostic services</dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-clinical-100/60 to-transparent blur-2xl" />

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,44,76,0.04),0_24px_48px_-16px_rgba(15,44,76,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate-400">
                  Complete Blood Count
                </p>
                <p className="font-display text-sm font-semibold text-clinical-950">
                  Sample #RX-08841
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {PANEL_ROWS.map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{row.label}</p>
                    <p className="font-mono text-[0.7rem] text-slate-400">
                      Ref. range {row.range}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-slate-800">
                      {row.value}
                    </p>
                    <p
                      className={
                        row.status === "flag"
                          ? "text-[0.68rem] font-semibold text-amber-600"
                          : "text-[0.68rem] font-semibold text-emerald-600"
                      }
                    >
                      {row.status === "flag" ? "Above range" : "Within range"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-clinical-50/70 px-3.5 py-2.5 text-[0.7rem] text-clinical-700">
              <span>Reviewed by Med Tech D. Santos, RMT</span>
              <span className="font-mono">04:12 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
