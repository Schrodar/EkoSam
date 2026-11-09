import Link from "next/link";
import {
  countSubmittedListings,
  getAllNews,
  getEconomyFigures,
  getMaintenanceRequests,
} from "@/lib/data";
import { StaleFiguresNotice } from "@/components/key-figures";
import { Card, CardBody } from "@/components/ui";
import { terms } from "@/config/terms";
import { isEnabled } from "@/lib/features";

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody>
          <p className="text-sm text-muted">{label}</p>
          <p
            className={
              highlight && value > 0
                ? "mt-1 text-3xl font-bold text-brand-700"
                : "mt-1 text-3xl font-bold text-foreground"
            }
          >
            {value}
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}

export default async function AdminDashboard() {
  const listings = isEnabled("listings");
  const keyFigures = isEnabled("keyFigures");
  const [maintenance, news, economy, submittedListings] = await Promise.all([
    getMaintenanceRequests(),
    getAllNews(),
    keyFigures ? getEconomyFigures() : Promise.resolve(null),
    listings ? countSubmittedListings() : Promise.resolve(0),
  ]);

  const newRequests = maintenance.filter((r) => r.status !== "atgardad").length;
  const drafts = news.filter((n) => !n.published).length;
  const handles = [
    "felanmälningar",
    ...(listings ? ["annonser"] : []),
    ...(isEnabled("displays") ? ["trapphustavlor"] : []),
  ];

  return (
    <div className="space-y-8">
      {economy ? <StaleFiguresNotice figures={economy} showLink /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Öppna felanmälningar"
          value={newRequests}
          href="/admin/felanmalningar"
          highlight
        />
        {listings ? (
          <StatCard
            label="Annonser att godkänna"
            value={submittedListings}
            href="/admin/till-salu"
            highlight
          />
        ) : null}
        <StatCard
          label="Utkast (nyheter)"
          value={drafts}
          href="/admin/nyheter"
        />
      </div>

      <Card>
        <CardBody>
          <h2 className="font-semibold">Kom igång</h2>
          <p className="mt-1 text-sm text-muted">
            Härifrån hanterar styrelsen allt innehåll på sidan. Använd flikarna
            ovan för att redigera nyheter, dokument, styrelseuppgifter och
            föreningsfakta och för att hantera{" "}
            {handles.length > 1
              ? `${handles.slice(0, -1).join(", ")} och ${handles.at(-1)}`
              : handles[0]}
            . Under Styrelse → Konton ger ni en ledamots {terms.unitAccount}{" "}
            admin-rätt. {terms.UnitsDefinite}s koder sköts av JnM.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
