import { requireFeature } from "@/lib/features";

/** Till salu kan vara avstängd för föreningen – se siteConfig.features. */
export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  requireFeature("listings");
  return children;
}
