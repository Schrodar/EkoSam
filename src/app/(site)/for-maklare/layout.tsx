import { requireFeature } from "@/lib/features";

/** För mäklare kan vara avstängd för föreningen – se siteConfig.features. */
export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  requireFeature("brokerPage");
  return children;
}
