import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-clinical-950 text-clinical-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <Logo variant="on-dark" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-clinical-200/80">
            Accurate results, kept simple — from same-day blood work to
            imaging, read by licensed medical technologists and radiologists.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-clinical-200/80">
            <li><Link href="/#about" className="hover:text-white">About</Link></li>
            <li><Link href="/#services" className="hover:text-white">Services</Link></li>
            <li><Link href="/#contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/login" className="hover:text-white">Patient Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-white">Reach Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-clinical-200/80">
            <li className="flex gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>2F RAPHA Medical Building, National Highway, Koronadal City, South Cotabato</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="h-4 w-4 shrink-0 mt-0.5" />
              <span>(083) 228 1122</span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="h-4 w-4 shrink-0 mt-0.5" />
              <span>care@raphadiagnostics.ph</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-clinical-300/70 lg:px-8">
        © {new Date().getFullYear()} RAPHA Diagnostic Laboratory. All rights reserved.
      </div>
    </footer>
  );
}
