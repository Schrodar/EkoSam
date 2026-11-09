/**
 * =============================================================================
 * SITECONFIG – det som hör till själva sajten, inte till föreningen.
 * =============================================================================
 * Föreningens uppgifter – namn, kortnamn, org.nr, adress, kontakt och
 * förvaltare – ligger i databasen och redigeras av styrelsen under
 * Admin → Föreningsinfo → Namn och kontakt. Läs dem med getAssociationProfile()
 * från "@/lib/data", aldrig härifrån.
 *
 * Här ligger det som följer med deployen:
 *
 *   1. Logotypfilerna i public/images/.
 *   2. Bakgrunden i heron (film eller bild).
 *   3. Interna nyckelrutter.
 *   4. Sajtens adress (för absoluta länkar i metadata och mejl).
 *
 *   import { siteConfig } from "@/config/siteConfig";
 *
 * Navigationens struktur (menygrupper/länkar) ligger i src/config/site.ts.
 * Färger/typsnitt ändras i src/app/globals.css.
 */

import { heroReel, type HeroReelConfig } from "./hero-reel";

export interface HeroBackground {
  /**
   * Filmrulle: flera klipp som tonar över i varandra (src/config/hero-reel.ts).
   * Går före både film och bild.
   */
  reel?: HeroReelConfig;
  /** Bakgrundsfilm. Går före bilden, som då blir poster tills filmen laddat. */
  video?: string;
  /** Bakgrundsbild. Visas när ingen film används. */
  image?: string;
}

/**
 * BAKGRUNDEN I HERON på startsidan. Kommentera ut raden du inte vill använda:
 *
 *   video – spelas om den finns och går före bilden
 *   image – visas när ingen film används
 *   båda bortkommenterade → den gröna bakgrunden (brand-800)
 *
 * Filmen anges per deploy i NEXT_PUBLIC_HERO_VIDEO, t.ex. "/videos/hero.mp4"
 * eller en CDN-adress. Den ligger inte i repot: filmen är föreningens egen
 * (eller licensierad) och får sällan spridas vidare i ett publikt repo.
 * Bilden läggs i public/images/. Raden och filen är sajtspecifika – se README.
 */
const hero: HeroBackground = {
  // EkoSam: vallmoäng, skog och solnedgång som tonar över i varandra.
  reel: heroReel,
  video: process.env.NEXT_PUBLIC_HERO_VIDEO,
  // image: "/images/hero.webp",
};

/**
 * Funktioner från BrfStart som en samfällighet inte använder. En avstängd
 * funktion har varken flikar, länkar eller sidor – adresserna ger 404.
 * Koden ligger kvar, så att strömbrytarna kan flytta till BrfStart som en del
 * av föreningstypen (se src/config/terms.ts).
 */
export interface SiteFeatures {
  /** Till salu: annonser för bostäder som säljs, och Sälja bostaden på Mina sidor. */
  listings: boolean;
  /** Trapphustavlor: skärmar med anslag i trapphusen. */
  displays: boolean;
  /** Planritningar för varje bostad, och sidan Min lägenhet på Mina sidor. */
  floorPlans: boolean;
  /** För mäklare: fakta för mäklare och köpare. */
  brokerPage: boolean;
  /**
   * Bostadsrätternas nyckeltal (avgift och skuld per kvm bostadsrätt med mera)
   * på Föreningens ekonomi och under Admin → Föreningsinfo → Ekonomi.
   */
  keyFigures: boolean;
}

const features: SiteFeatures = {
  listings: false,
  displays: false,
  floorPlans: false,
  brokerPage: false,
  keyFigures: false,
};

export const siteConfig = {
  /** Kort beskrivning – visas som ingress i sidomenyn. */
  description: "Information för medlemmar och besökare.",

  hero,

  features,

  logo: {
    /** Primär logotyp (mörk, för ljus bakgrund). */
    src: "/images/logo.svg",
    /** Ljus/inverterad logotyp för mörka ytor. Lämna tom om den saknas. */
    lightSrc: "/images/logo-light.svg",
    /** Favicon (SVG eller .ico). */
    favicon: "/images/logo.svg",
  },

  /** Interna nyckelrutter (används av knappar/länkar). */
  links: {
    contact: "/kontakt",
    faultReport: "/felanmalan",
    login: "/logga-in",
  },

  seo: {
    /**
     * Sajtens adress – bas för absoluta länkar i metadata och mejl.
     * Platshållare: byts mot samfällighetens domän.
     */
    siteUrl: "https://www.exempelgarden.se",
  },
} as const;

export type SiteConfig = typeof siteConfig;
