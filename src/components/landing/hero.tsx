"use client";

import { ShieldCheck } from "lucide-react";
import { LinkButton, Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";
import { DnaHelix } from "@/components/landing/dna-helix";

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
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => scrollToSection("services")}
            >
              View Services
            </Button>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-slate-100 pt-8">
            <div>
              <dt className="text-2xl font-bold text-clinical-950 font-display">5+</dt>
              <dd className="text-xs text-slate-500">Years serving Kidapawan</dd>
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

        <div className="relative mx-auto flex w-full max-w-md items-center justify-center lg:mx-0 lg:ml-auto">
          <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-clinical-100/50 via-vital-50/30 to-transparent blur-3xl" />
          <DnaHelix />
        </div>
      </div>
    </section>
  );
}
