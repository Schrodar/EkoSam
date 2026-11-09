import { requireFeature } from "@/lib/features";

/** Till salu kan vara avstängd för föreningen – se siteConfig.features. */
export default function AdminListingsLayout({ children }: { children: React.ReactNode }) {
  requireFeature("listings");
  return children;
}
