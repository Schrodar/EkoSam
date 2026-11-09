import { requireFeature } from "@/lib/features";

/**
 * Min lägenhet (fakta och planritning) hör till planritningarna, som kan vara
 * avstängda – se siteConfig.features.
 */
export default function MyHomeLayout({ children }: { children: React.ReactNode }) {
  requireFeature("floorPlans");
  return children;
}
