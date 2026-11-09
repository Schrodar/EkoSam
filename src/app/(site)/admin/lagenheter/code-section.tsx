import type { Apartment } from "@/lib/types";
import { terms } from "@/config/terms";
import { Card, CardBody } from "@/components/ui";
import { createCodesAction } from "./actions";
import { CodeLettersButton, type LetterSender } from "./code-letters";

const countText = (count: number) =>
  `${count} ${count === 1 ? terms.unit : terms.units}`;

/**
 * Koder och brev för en samling fastigheter – hela föreningen eller ett område.
 * scope följer createCodesAction: "" = alla, annars område-id eller "ej-placerade".
 */
export function CodeSection({
  apartments,
  scope,
  sender,
  title,
}: {
  apartments: Apartment[];
  scope: string;
  sender: LetterSender;
  title: string;
}) {
  const total = apartments.length;
  const withCode = apartments.filter((a) => a.accessCodeCreatedAt).length;
  const activated = apartments.filter((a) => a.ownerMemberId).length;
  const missing = total - withCode;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Varje {terms.unit} får en kod i ett brev till brevlådan. Koden skapar{" "}
          {terms.unitGenitive} konto på /aktivera. {withCode} av {countText(total)}{" "}
          har kod, och {activated} har ett aktiverat konto.
        </p>
      </div>
      <Card>
        <CardBody className="space-y-5">
          {/* Knapparna renderas alltid och döljs med available – annars
              försvinner breven när sidan ritas om efter att koderna skapats. */}
          <CodeLettersButton
            action={createCodesAction}
            fields={{ scope, onlyMissing: "1" }}
            label={`Skapa koder för ${countText(missing)} utan kod`}
            sender={sender}
            available={missing > 0}
          />
          <CodeLettersButton
            action={createCodesAction}
            fields={{ scope, onlyMissing: "0" }}
            label="Nya koder för alla"
            variant="secondary"
            confirmText={`Alla ${terms.units} här får nya koder, och de gamla slutar gälla direkt. Konton som redan finns fungerar som förut tills någon använder den nya koden.`}
            sender={sender}
            available={withCode > 0}
          />
          {total === 0 ? (
            <p className="text-sm text-muted">Lägg till {terms.units} först.</p>
          ) : null}
        </CardBody>
      </Card>
    </section>
  );
}
