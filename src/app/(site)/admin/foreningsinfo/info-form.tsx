"use client";

import { useActionState } from "react";
import { updateAssociationInfoAction } from "./actions";
import type { FormState } from "@/lib/form";
import type { AssociationInfo } from "@/lib/types";
import { terms } from "@/config/terms";
import {
  Field,
  FormSuccess,
  Input,
  SubmitButton,
  Textarea,
} from "@/components/ui";

/**
 * EkoSam: samfällighetens fakta. Mark, uppvärmning, tvätt, energiklass och
 * husdjur gäller varje fastighet för sig och visas inte; fälten skickas dolda
 * med sina värden, så att inget som redan finns skrivs över.
 */
export function InfoForm({ info }: { info: AssociationInfo }) {
  const [state, action] = useActionState<FormState, FormData>(
    updateAssociationInfoAction,
    {},
  );

  return (
    <form action={action} className="space-y-6">
      {state.success ? <FormSuccess>{state.success}</FormSuccess> : null}
      <input type="hidden" name="landOwnership" value={info.landOwnership} />
      <input type="hidden" name="heating" value={info.heating} />
      <input type="hidden" name="laundry" value={info.laundry} />
      <input type="hidden" name="energyClass" value={info.energyClass} />
      <input type="hidden" name="pets" value={info.pets} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bildad (år)" htmlFor="builtYear">
          <Input
            id="builtYear"
            name="builtYear"
            type="number"
            defaultValue={info.builtYear}
          />
        </Field>
        <Field label={`Antal ${terms.units}`} htmlFor="apartments">
          <Input
            id="apartments"
            name="apartments"
            type="number"
            defaultValue={info.apartments}
          />
        </Field>
        <Field label="Föreningsform" htmlFor="associationType" hint="T.ex. Samfällighetsförening.">
          <Input
            id="associationType"
            name="associationType"
            defaultValue={info.associationType}
          />
        </Field>
        <Field label="Parkering" htmlFor="parking">
          <Input id="parking" name="parking" defaultValue={info.parking} />
        </Field>
        <Field label="Bredband/TV" htmlFor="broadband">
          <Input
            id="broadband"
            name="broadband"
            defaultValue={info.broadband}
          />
        </Field>
      </div>

      <Field
        label="Gemensamma anläggningar"
        htmlFor="commonAreas"
        hint="T.ex. vägar, belysning, badpool och grönytor."
      >
        <Textarea
          id="commonAreas"
          name="commonAreas"
          defaultValue={info.commonAreas}
          className="min-h-20"
        />
      </Field>
      <Field label="Avgiften – vad den täcker" htmlFor="feesInfo">
        <Textarea
          id="feesInfo"
          name="feesInfo"
          defaultValue={info.feesInfo}
          className="min-h-20"
        />
      </Field>
      <Field label="Ekonomi (sammanfattning)" htmlFor="economySummary">
        <Textarea
          id="economySummary"
          name="economySummary"
          defaultValue={info.economySummary}
          className="min-h-20"
        />
      </Field>
      <Field
        label="Genomfört underhåll"
        htmlFor="renovationsDone"
        hint="En per rad."
      >
        <Textarea
          id="renovationsDone"
          name="renovationsDone"
          defaultValue={info.renovationsDone.join("\n")}
        />
      </Field>
      <Field
        label="Planerat underhåll"
        htmlFor="renovationsPlanned"
        hint="En per rad."
      >
        <Textarea
          id="renovationsPlanned"
          name="renovationsPlanned"
          defaultValue={info.renovationsPlanned.join("\n")}
        />
      </Field>

      <SubmitButton>Spara föreningsinfo</SubmitButton>
    </form>
  );
}
