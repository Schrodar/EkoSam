"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";
import type { Apartment } from "@/lib/types";
import { terms } from "@/config/terms";
import {
  Field,
  FormError,
  FormSuccess,
  Input,
  SubmitButton,
  Textarea,
} from "@/components/ui";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * EkoSam: fastighetens uppgifter – numret, fastighetsbeteckningen och en
 * beskrivning. Fastigheter har varken våning, rum eller yta; fälten skickas
 * dolda med sina värden, så att inget som redan finns skrivs över.
 */
export function FactsForm({
  apartment,
  action,
  editNumbers = true,
}: {
  apartment: Apartment;
  action: Action;
  /**
   * Får numren ändras? Fastighetsnumret är medlemmarnas inloggning, så bara
   * JnM ändrar numren (i supportläget).
   */
  editNumbers?: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="apartmentId" value={apartment.id} />
      <input type="hidden" name="floor" value={apartment.floor} />
      <input type="hidden" name="rooms" value={apartment.rooms} />
      <input type="hidden" name="sizeSqm" value={apartment.sizeSqm} />
      {state.error ? <FormError>{state.error}</FormError> : null}
      {state.success ? <FormSuccess>{state.success}</FormSuccess> : null}

      {editNumbers ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={terms.UnitNumber}
            htmlFor="number"
            required
            hint={`Föreningens eget nummer. Unikt i föreningen – och ${terms.unitGenitive} inloggning.`}
          >
            <Input
              id="number"
              name="number"
              defaultValue={apartment.number}
              required
            />
          </Field>
          <Field
            label={terms.OfficialNumber}
            htmlFor="standardNumber"
            hint={`Lantmäteriets beteckning, t.ex. ${terms.officialNumberExample}. Valfri.`}
          >
            <Input
              id="standardNumber"
              name="standardNumber"
              defaultValue={apartment.standardNumber}
            />
          </Field>
        </div>
      ) : (
        <>
          <input type="hidden" name="number" value={apartment.number} />
          <input type="hidden" name="standardNumber" value={apartment.standardNumber} />
        </>
      )}
      <Field
        label="Beskrivning"
        htmlFor="description"
        hint="T.ex. gatuadress eller annat som hjälper styrelsen."
      >
        <Textarea
          id="description"
          name="description"
          defaultValue={apartment.description}
        />
      </Field>

      <SubmitButton>Spara uppgifterna</SubmitButton>
    </form>
  );
}
