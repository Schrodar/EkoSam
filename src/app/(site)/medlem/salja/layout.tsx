import { requireFeature } from "@/lib/features";

/** Sälja bostaden hör till Till salu, som kan vara avstängd – se siteConfig.features. */
export default function SellLayout({ children }: { children: React.ReactNode }) {
  requireFeature("listings");
  return children;
}
