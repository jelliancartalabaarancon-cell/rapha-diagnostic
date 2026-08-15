import {
  Activity,
  Baby,
  ClipboardList,
  Droplet,
  FlaskConical,
  HeartPulse,
  ScanLine,
  TestTube,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  droplet: Droplet,
  "test-tube": TestTube,
  "flask-conical": FlaskConical,
  "heart-pulse": HeartPulse,
  baby: Baby,
  "scan-line": ScanLine,
  activity: Activity,
  "clipboard-list": ClipboardList,
};

export function getServiceIcon(key: string): LucideIcon {
  return SERVICE_ICONS[key] ?? FlaskConical;
}
