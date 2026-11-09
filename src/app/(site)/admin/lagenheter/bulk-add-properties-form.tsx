"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/form";
import { buildApartmentNumbers, DEFAULT_NUMBER_START } from "@/lib/numbering";
import { terms } from "@/config/terms";
import {
  Field,
  FormError,
  FormSuccess,
  Input,
  SubmitButton,
} from "@/components/ui";
import { bulkAddPropertiesAction } from "./actions";

/**
 * EkoSam: fastigheter i följd i ett område. Ett första nummer och ett antal –
 * fastigheter har inga våningar och inget lantmäterinummer. Förhandsvisningen
 * räknas ut av samma funktion som servern använder.
 */
export function BulkAddPropertiesForm({
  buildingId,
  numberStart,
}: {
  buildingId: string;
  numberStart: string | null | undefined;
}) {
  const [state, action] = useActionState<FormState, FormData>(
    bulkAddPropertiesAction,
    {},
  );
  const [start, setStart] = useState(numberStart || DEFAULT_NUMBER_START);
  const [count, setCount] = useState(10);

  const valid = Number.isInteger(count) && count >= 1 && count <= 300;
  const numbers = valid
    ? buildApartmentNumbers({
        floors: [{ floor: 0, count }],
        start,
        topDown: false,
      }).map((p) => p.number)
    : [];

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="buildingId" value={buildingId} />
      {state.error ? <FormError>{state.error}</FormError> : null}
      {state.success ? <FormSuccess>{state.success}</FormSuccess> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={`Första ${terms.unitNumber}`}
          htmlFor="properties-start"
          hint="Nollor behålls: 001 ger tresiffriga nummer."
        >
          <Input
            id="properties-start"
            name="start"
            value={start}
            onChange={(e) => setStart(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            required
          />
        </Field>
        <Field label={`Antal ${terms.units}`} htmlFor="properties-count" hint="Högst 300 på en gång.">
          <Input
            id="properties-count"
            name="count"
            type="number"
            min={1}
            max={300}
            value={Number.isNaN(count) ? "" : count}
            onChange={(e) => setCount(e.target.valueAsNumber)}
            required
          />
        </Field>
      </div>

      <p className="text-sm text-muted">
        {numbers.length > 0
          ? `${terms.Unit} ${numbers[0]}${
              numbers.length > 1 ? `–${numbers[numbers.length - 1]}` : ""
            } läggs till. Nummer som redan finns hoppas över.`
          : `Ange ett antal mellan 1 och 300.`}
      </p>

      <SubmitButton pendingText="Lägger till…">Lägg till {terms.units}</SubmitButton>
    </form>
  );
}
