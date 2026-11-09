import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSupport } from "@/lib/auth";
import {
  getApartmentAccount,
  getApartmentById,
  getAssociationProfile,
} from "@/lib/data";
import type { ApartmentAccount } from "@/lib/data/access-codes";
import { formatDate } from "@/lib/utils";
import { isEnabled } from "@/lib/features";
import { terms, unitName } from "@/config/terms";
import { Card, CardBody, PageHeader } from "@/components/ui";
import { FactsForm } from "@/components/apartment/facts-form";
import { FloorPlanManager } from "@/components/apartment/floor-plan-manager";
import {
  changeOwnerAction,
  deleteApartmentAction,
  newCodeAction,
  removeFloorPlanAction,
  updateFactsAction,
  uploadFloorPlanAction,
} from "../actions";
import { CodeLettersButton } from "../code-letters";
import { startListingAction } from "../../till-salu/actions";

interface Props {
  params: Promise<{ id: string }>;
}

function accountText(account: ApartmentAccount | null): string {
  if (!account) return "Inte aktiverat ännu.";
  if (account.kind === "personal") {
    return `Ett personligt konto från tiden med registrering. Det ersätts när ${terms.unitGenitive} kod används.`;
  }
  const activated = `Aktiverat ${formatDate(account.activatedAt)}.`;
  return account.isAdmin
    ? `${activated} Kontot har admin-rätt – någon ${terms.atUnit} sitter i styrelsen. Admin-rätten ändras under Konton.`
    : activated;
}

/** EkoSam: en fastighet i registret – uppgifterna, koden och kontot. */
export default async function AdminApartmentEditPage({ params }: Props) {
  await requireSupport();
  const { id } = await params;
  const [apartment, account, profile] = await Promise.all([
    getApartmentById(id),
    getApartmentAccount(id),
    getAssociationProfile(),
  ]);
  if (!apartment) notFound();
  const sender = { name: profile.name, contactEmail: profile.contactEmail };
  const listings = isEnabled("listings");

  return (
    <div className="space-y-8">
      <PageHeader
        title={unitName(apartment.number)}
        description={
          [
            apartment.standardNumber,
            account
              ? `${terms.UnitDefinite} har ett konto.`
              : `${terms.UnitDefinite} har inget konto ännu.`,
          ]
            .filter(Boolean)
            .join(" · ")
        }
        actions={
          <form action={deleteApartmentAction}>
            <input type="hidden" name="apartmentId" value={apartment.id} />
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Ta bort {terms.unit}
            </button>
          </form>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <h3 className="font-semibold">Uppgifter</h3>
          <FactsForm apartment={apartment} action={updateFactsAction} />
        </CardBody>
      </Card>

      {isEnabled("floorPlans") ? (
        <Card>
          <CardBody className="space-y-3">
            <h3 className="font-semibold">Planritning</h3>
            <FloorPlanManager
              apartment={apartment}
              uploadAction={uploadFloorPlanAction}
              removeAction={removeFloorPlanAction}
            />
          </CardBody>
        </Card>
      ) : null}

      {/* Försäljningen bor under Till salu – här finns bara vägen dit. */}
      {listings ? (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            {apartment.forSale ? (
              <>
                <p className="text-sm text-muted">{terms.UnitDefinite} är till salu.</p>
                <Link
                  href={`/admin/till-salu/${apartment.id}`}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  Hantera annonsen →
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">
                  {terms.UnitDefinite} är inte till salu.
                </p>
                <form action={startListingAction}>
                  <input type="hidden" name="apartmentId" value={apartment.id} />
                  <button className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-black/5">
                    Lägg ut till salu
                  </button>
                </form>
              </>
            )}
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody className="space-y-5">
          <div>
            <h3 className="font-semibold">Kod och konto</h3>
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[8rem_1fr]">
              <dt className="text-muted">Kod</dt>
              <dd>
                {apartment.accessCodeCreatedAt
                  ? `Skapad ${formatDate(apartment.accessCodeCreatedAt)}.`
                  : "Ingen kod ännu."}
              </dd>
              <dt className="text-muted">Konto</dt>
              <dd>{accountText(account)}</dd>
            </dl>
          </div>

          <div className="space-y-2 border-t border-border pt-5">
            <p className="text-sm text-muted">
              Tappad kod: {terms.unitDefinite} får en ny, och den gamla slutar
              gälla. Kontot finns kvar tills någon använder den nya koden.
            </p>
            <CodeLettersButton
              action={newCodeAction}
              fields={{ apartmentId: apartment.id }}
              label={apartment.accessCodeCreatedAt ? "Ny kod" : "Skapa kod"}
              pendingText="Skapar kod…"
              variant="secondary"
              sender={sender}
            />
          </div>

          <div className="space-y-2 border-t border-border pt-5">
            <p className="text-sm text-muted">
              Ägarbyte: kontot raderas och säljaren loggas ut,
              {listings ? " annonsen och bilderna raderas," : ""} och{" "}
              {terms.unitDefinite} får en ny kod – brevet till köparen.
              Uppgifterna ligger kvar.
            </p>
            <CodeLettersButton
              action={changeOwnerAction}
              fields={{ apartmentId: apartment.id }}
              label="Registrera ägarbyte"
              pendingText="Registrerar…"
              variant="danger"
              confirmText={`${terms.UnitGenitive} konto raderas och alla som är inloggade loggas ut.${
                listings ? " Annonsen och bilderna raderas." : ""
              } Den gamla koden slutar gälla. Går inte att ångra.`}
              sender={sender}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
