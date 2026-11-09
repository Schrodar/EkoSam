import { requireFeature } from "@/lib/features";

/** Trapphustavlorna kan vara avstängda för föreningen – se siteConfig.features. */
export default function AdminDisplaysLayout({ children }: { children: React.ReactNode }) {
  requireFeature("displays");
  return children;
}
