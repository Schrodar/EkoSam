import { notFound } from "next/navigation";
import { siteConfig, type SiteFeatures } from "@/config/siteConfig";

/**
 * Strömbrytarna i siteConfig.features. En avstängd funktion har varken flikar,
 * länkar eller sidor: komponenterna frågar `isEnabled`, och funktionens egen
 * layout anropar `requireFeature`, så att adresserna ger 404.
 */
export function isEnabled(feature: keyof SiteFeatures): boolean {
  return siteConfig.features[feature];
}

/** Överst i en avstängd funktions layout eller route: 404. */
export function requireFeature(feature: keyof SiteFeatures): void {
  if (!isEnabled(feature)) notFound();
}
