"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui";
import { terms } from "@/config/terms";
import { moveApartmentAction } from "./actions";

/**
 * Flyttar en lägenhet mellan hus. Sparar direkt vid val – ett extra
 * "Spara"-klick per rad vore bara i vägen när man placerar många på rad.
 */
export function MoveApartmentForm({
  apartmentId,
  currentBuildingId,
  buildings,
}: {
  apartmentId: string;
  currentBuildingId: string | null;
  buildings: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      aria-label={`Flytta ${terms.unitDefinite} till ett annat ${terms.group}`}
      defaultValue={currentBuildingId ?? ""}
      disabled={pending}
      className="w-44 text-sm"
      onChange={(e) => {
        const buildingId = e.target.value;
        startTransition(async () => {
          await moveApartmentAction(apartmentId, buildingId);
        });
      }}
    >
      <option value="">Ej placerad</option>
      {buildings.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </Select>
  );
}
