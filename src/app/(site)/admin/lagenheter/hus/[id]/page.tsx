import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSupport } from "@/lib/auth";
import {
  getApartmentsByBuilding,
  getAssociationProfile,
  getBuildingById,
  getBuildings,
  getUnassignedApartments,
} from "@/lib/data";
import type { Apartment } from "@/lib/types";
import { formatApartmentNumber } from "@/lib/numbering";
import { terms } from "@/config/terms";
import { Card, CardBody, EmptyState, PageHeader } from "@/components/ui";
import { BulkAddPropertiesForm } from "../../bulk-add-properties-form";
import { CodeSection } from "../../code-section";
import { MoveApartmentForm } from "../../move-apartment-form";

interface Props {
  params: Promise<{ id: string }>;
}

/** Samlingsvyn för fastigheter som saknar område använder samma sida. */
const UNASSIGNED = "ej-placerade";

/**
 * EkoSam: fastigheterna i ett område. Fastigheter har varken våningar, rum,
 * yta eller planritning, så tabellen visar bara numret med
 * fastighetsbeteckningen och kontots läge.
 */
function ApartmentTable({
  apartments,
  buildings,
  currentBuildingId,
}: {
  apartments: Apartment[];
  buildings: { id: string; name: string }[];
  currentBuildingId: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="border-b border-border text-left text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">{terms.Unit}</th>
            <th className="px-4 py-3 font-medium">Konto</th>
            <th className="px-4 py-3 font-medium">Flytta till</th>
            <th className="px-4 py-3 text-right font-medium">Åtgärd</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {apartments.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3">
                <span className="font-medium text-foreground">
                  {formatApartmentNumber(a.number, a.standardNumber)}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {a.ownerMemberId
                  ? "Aktiverat"
                  : a.accessCodeCreatedAt
                    ? "Kod skapad"
                    : "Ingen kod"}
              </td>
              <td className="px-4 py-3">
                <MoveApartmentForm
                  apartmentId={a.id}
                  currentBuildingId={currentBuildingId}
                  buildings={buildings}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/lagenheter/${a.id}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  Redigera
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BuildingPage({ params }: Props) {
  await requireSupport();
  const { id } = await params;
  const unassignedView = id === UNASSIGNED;

  const [building, buildings, profile] = await Promise.all([
    unassignedView ? Promise.resolve(null) : getBuildingById(id),
    getBuildings(),
    getAssociationProfile(),
  ]);
  if (!unassignedView && !building) notFound();

  const apartments = unassignedView
    ? await getUnassignedApartments()
    : await getApartmentsByBuilding(id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={unassignedView ? "Ej placerade" : building!.name}
        description={
          unassignedView
            ? `${terms.Units} som inte hör till något ${terms.group} ännu. Placera dem för att få med dem i översikten.`
            : building!.address || undefined
        }
        actions={
          <Link
            href="/admin/lagenheter"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            ← Alla {terms.groups}
          </Link>
        }
      />

      {apartments.length === 0 ? (
        <EmptyState
          title={
            unassignedView
              ? `Alla ${terms.units} är placerade`
              : `Inga ${terms.units} i ${terms.groupDefinite} ännu`
          }
        />
      ) : (
        <ApartmentTable
          apartments={apartments}
          buildings={buildings}
          currentBuildingId={unassignedView ? null : id}
        />
      )}

      {apartments.length > 0 ? (
        <CodeSection
          apartments={apartments}
          scope={id}
          sender={{ name: profile.name, contactEmail: profile.contactEmail }}
          title={unassignedView ? "Koder och brev" : `Koder och brev för ${terms.groupDefinite}`}
        />
      ) : null}

      {!unassignedView ? (
        <Card>
          <CardBody className="space-y-4">
            <div>
              <h3 className="font-semibold">Lägg till {terms.units}</h3>
              <p className="text-sm text-muted">
                Numren löper i följd från {terms.groupDefinite}s startnummer (
                {building!.numberStart}). Nummer som redan finns hoppas över,
                och varje {terms.unit} går att ändra i efterhand – där skriver du
                också in {terms.officialNumber}en.
              </p>
            </div>
            <BulkAddPropertiesForm buildingId={id} numberStart={building!.numberStart} />
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
