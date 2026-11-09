/**
 * =============================================================================
 * ORDEN – samfällighetens ord där BrfStart säger lägenhet, hus och boende.
 * =============================================================================
 * EkoSam är BrfStart anpassad för en samfällighetsförening. Allt som skiljer
 * orden samlas här, så att det går att flytta till BrfStart som en föreningstyp
 * (bostadsrättsförening / samfällighet) när EkoSam är klar.
 *
 *   import { terms, unitName } from "@/config/terms";
 *
 * Gemen/versal: `unit` mitt i en mening, `Unit` först i en mening eller rubrik.
 */
export const terms = {
  /** Föreningen i bestämd form: "samfälligheten". */
  association: "samfälligheten",
  Association: "Samfälligheten",
  /** "samfällighetens hemsida". */
  associationGenitive: "samfällighetens",
  /** Föreningsformen: "samfällighetsförening". */
  associationKind: "samfällighetsförening",

  /** Medlemmens enhet – det BrfStart kallar lägenhet. */
  unit: "fastighet",
  Unit: "Fastighet",
  unitDefinite: "fastigheten",
  UnitDefinite: "Fastigheten",
  units: "fastigheter",
  Units: "Fastigheter",
  unitsDefinite: "fastigheterna",
  UnitsDefinite: "Fastigheterna",
  /** "fastighetens konto". */
  unitGenitive: "fastighetens",
  UnitGenitive: "Fastighetens",
  /** Sammansatt: "fastighetskonto". */
  unitAccount: "fastighetskonto",
  /** Numret medlemmen loggar in med – föreningens eget nummer. */
  unitNumber: "fastighetsnummer",
  UnitNumber: "Fastighetsnummer",
  /** "Logga in med fastighetsnumret". */
  unitNumberDefinite: "fastighetsnumret",
  /** Den officiella beteckningen – det BrfStart kallar Lantmäteriets nummer. */
  officialNumber: "fastighetsbeteckning",
  OfficialNumber: "Fastighetsbeteckning",
  officialNumberExample: "Ekoby 1:23",

  /** Grupperingen i registret – det BrfStart kallar hus. */
  group: "område",
  Group: "Område",
  groupDefinite: "området",
  groups: "områden",
  Groups: "Områden",
  groupHint: "t.ex. en gata eller en radhuslänga",

  /** De som hör till föreningen – det BrfStart kallar boende. */
  members: "medlemmar",
  Members: "Medlemmar",
} as const;

/** "Fastighet 23" – så heter fastighetens konto, och ärendena det gör. */
export function unitName(number: string): string {
  return `${terms.Unit} ${number}`;
}
