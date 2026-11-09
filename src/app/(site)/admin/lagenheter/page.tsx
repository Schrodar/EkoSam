import Link from "next/link";
import { requireSupport } from "@/lib/auth";
import {
  getAllApartments,
  getAssociationProfile,
  getBuildingsWithCounts,
  getUnassignedApartments,
} from "@/lib/data";
import type { BuildingWithCounts } from "@/lib/types";
import { terms } from "@/config/terms";
import { Card, CardBody, PageHeader } from "@/components/ui";
import { BuildingManager } from "./building-manager";
import { CodeSection } from "./code-section";

function BuildingCard({ building }: { building: BuildingWithCounts }) {
  return (
    <Link href={`/admin/lagenheter/hus/${building.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="space-y-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {building.name}
            </p>
            {building.address ? (
              <p className="truncate text-sm text-muted">{building.address}</p>
            ) : null}
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {building.apartmentCount}
          </p>
          <p className="text-sm text-muted">
            {building.apartmentCount === 1 ? terms.unit : terms.units}
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}

/** EkoSam: registret över samfällighetens fastigheter, område för område. */
export default async function AdminApartmentsPage() {
  await requireSupport();
  const [buildings, unassigned, apartments, profile] = await Promise.all([
    getBuildingsWithCounts(),
    getUnassignedApartments(),
    getAllApartments(),
    getAssociationProfile(),
  ]);

  const total =
    buildings.reduce((sum, b) => sum + b.apartmentCount, 0) + unassigned.length;

  return (
    <div className="space-y-10">
      <PageHeader
        title={terms.Units}
        description={`${terms.Association}s ${terms.units}, ${terms.group} för ${terms.group}. ${total} ${
          total === 1 ? terms.unit : terms.units
        } i registret. Bara du ser sidan, i supportläget.`}
      />

      {buildings.length === 0 && unassigned.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center text-sm text-muted">
            Registret är tomt. Börja med att lägga till ett {terms.group} nedan –
            sedan kan du fylla det med {terms.units} på en gång.
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <BuildingCard key={b.id} building={b} />
          ))}

          {/* Fastigheter utan område. Kortet visas bara när det finns några. */}
          {unassigned.length > 0 ? (
            <Link href="/admin/lagenheter/hus/ej-placerade">
              <Card className="h-full border-dashed transition-shadow hover:shadow-md">
                <CardBody className="space-y-2">
                  <p className="font-semibold text-foreground">Ej placerade</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {unassigned.length}
                  </p>
                  <p className="text-sm text-muted">
                    saknar {terms.group} – placera dem här
                  </p>
                </CardBody>
              </Card>
            </Link>
          ) : null}
        </div>
      )}

      <CodeSection
        apartments={apartments}
        scope=""
        sender={{ name: profile.name, contactEmail: profile.contactEmail }}
        title="Koder och brev"
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{terms.Groups}</h2>
        <BuildingManager buildings={buildings} />
      </section>
    </div>
  );
}
