/**
 * =============================================================================
 * FILMRULLEN I HERON – tre klipp som tonar över i varandra, i en slinga.
 * =============================================================================
 * Ordningen här är ordningen på sajten. Efter sista klippet tonar rullen
 * tillbaka till det första, med samma övergång som mellan de andra.
 *
 *   Vallmoäng → skog → solnedgång → (tillbaka till) vallmoäng
 *   5,8 + 4,6 + 5,4 − 3 × 0,6 = 14 sekunder per varv
 *
 * Filerna är redan beskurna och optimerade (H.264, 1280×720, 30 bilder/s,
 * utan ljud, faststart). Varje fil spelas från början till slut – längderna
 * nedan styr bara när nästa klipp tonar in, 0,6 sekunder före slutet.
 *
 * Bildposition: object-position för bred skärm (position) och för mobil
 * (mobilePosition, under 768 px). Filmerna fyller alltid heron (cover), så
 * positionen avgör vilken del av bilden som syns när formaten skiljer sig.
 *
 * Komponenten som spelar rullen är src/components/layout/hero-reel.tsx.
 */

export interface HeroClip {
  /** Vad klippet visar – för den som underhåller listan. */
  label: string;
  /** Filen i public/. */
  src: string;
  /** Klippets längd i sekunder. Ska stämma med filen. */
  duration: number;
  /** Bildposition på bred skärm, t.ex. "50% 50%". */
  position: string;
  /** Bildposition på mobil (under 768 px). */
  mobilePosition: string;
}

export interface HeroReelConfig {
  clips: HeroClip[];
  /** Övergångens längd i sekunder. */
  crossfade: number;
  /**
   * Stillbild ur första klippet. Syns innan filmen har startat, utan
   * JavaScript, vid prefers-reduced-motion och i datasparläge.
   */
  poster: string;
}

export const heroReel: HeroReelConfig = {
  crossfade: 0.6,
  poster: "/images/hero-poster.jpg",
  clips: [
    {
      label: "Vallmoäng",
      src: "/hero/01-vallmoang.mp4",
      duration: 5.8,
      position: "50% 50%",
      mobilePosition: "62% 50%",
    },
    {
      label: "Skog",
      src: "/hero/02-skog.mp4",
      duration: 4.6,
      position: "50% 50%",
      mobilePosition: "58% 50%",
    },
    {
      label: "Solnedgång",
      src: "/hero/03-solnedgang.mp4",
      duration: 5.4,
      position: "50% 50%",
      mobilePosition: "56% 50%",
    },
  ],
};
