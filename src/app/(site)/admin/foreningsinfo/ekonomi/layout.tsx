import { requireFeature } from "@/lib/features";

/**
 * Nyckeltalen gäller bostadsrättsföreningar och kan vara avstängda – se
 * siteConfig.features. Avgiften och ekonomin i korthet skrivs under Fakta.
 */
export default function AdminEconomyLayout({ children }: { children: React.ReactNode }) {
  requireFeature("keyFigures");
  return children;
}
