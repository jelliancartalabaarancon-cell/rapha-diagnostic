import { Compass, HeartHandshake, Target } from "lucide-react";

const PILLARS = [
  {
    icon: Target,
    title: "Mission",
    body: "To provide accurate, timely, and affordable diagnostic services that help physicians and patients make confident decisions about their health.",
  },
  {
    icon: Compass,
    title: "Vision",
    body: "To be the most trusted diagnostic laboratory in the region — recognized for precision, integrity, and genuine care for every patient we serve.",
  },
  {
    icon: HeartHandshake,
    title: "Commitment",
    body: "Every specimen is handled by licensed medical technologists under strict quality-control protocols, and every result is reviewed before it reaches you.",
  },
];

export function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">
            About RAPHA
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-clinical-950 sm:text-4xl">
            A diagnostic laboratory built around the wait, not just the test
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            RAPHA Diagnostic Laboratory is a full-service testing facility
            offering blood chemistry, hematology, urinalysis, imaging, and
            cardiac diagnostics. We built our patient portal because we
            believe the hardest part of a lab visit isn&apos;t the needle —
            it&apos;s not knowing when your results, or your next
            appointment, are actually happening.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_1px_2px_rgba(15,44,76,0.04),0_12px_32px_-16px_rgba(15,44,76,0.12)] transition-transform hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-clinical-50 text-clinical-600">
                <pillar.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-clinical-950">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
