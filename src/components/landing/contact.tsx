import { Clock, Mail, MapPin, Phone } from "lucide-react";

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    label: "Address",
    value: "2F RAPHA Medical Building, National Highway, Koronadal City, South Cotabato",
  },
  {
    icon: Phone,
    label: "Contact Number",
    value: "(083) 228 1122 / 0917 300 4455",
  },
  {
    icon: Mail,
    label: "Email Address",
    value: "care@raphadiagnostics.ph",
  },
  {
    icon: Clock,
    label: "Clinic Hours",
    value: "Mon–Sat, 6:00 AM – 5:00 PM  ·  Closed Sundays and holidays",
  },
];

export function Contact() {
  return (
    <section id="contact" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-clinical-600">
            Get in Touch
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-clinical-950 sm:text-4xl">
            Visit or reach us directly
          </h2>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ul className="space-y-6">
            {CONTACT_ITEMS.map((item) => (
              <li key={item.label} className="flex gap-4 rounded-2xl border border-slate-100 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clinical-50 text-clinical-600">
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            <iframe
              title="RAPHA Diagnostic Laboratory location"
              src="https://maps.google.com/maps?q=Koronadal%20City%2C%20South%20Cotabato&t=&z=14&ie=UTF8&iwloc=&output=embed"
              className="h-full min-h-[340px] w-full grayscale-[15%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
