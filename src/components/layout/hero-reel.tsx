"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import type { HeroClip, HeroReelConfig } from "@/config/hero-reel";

/**
 * Filmrullen i heron: klippen i src/config/hero-reel.ts, ett videolager per
 * klipp, som tonar över i varandra i en slinga.
 *
 * - Det inkommande lagret tonar in ovanpå. Det utgående ligger kvar helt
 *   synligt under hela toningen, så att bilden aldrig blir svart eller blinkar.
 * - Nästa klipp – även det första inför återgången – laddas och spolas till
 *   början i förväg. Övergången börjar först när klippet kan spelas. Dröjer
 *   det, ligger den synliga bilden kvar (som sista bildruta) tills det går.
 * - Tidtagningen är en timer räknad på klippets position, toningen en Web
 *   Animation – inga React-uppdateringar och ingen loop per bildruta.
 * - Rullen pausas när heron inte syns eller fliken ligger i bakgrunden.
 *   Toningen pausas med filmen.
 * - Vid prefers-reduced-motion och i datasparläge hämtas ingen film: då syns
 *   stillbilden, som också syns innan filmen startat och utan JavaScript.
 */

type Phase = "starting" | "playing" | "preparing" | "fading" | "stopped";

type NetworkNavigator = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

/** Stillbild i stället för film: minskad rörelse, datasparläge eller 2G. */
function prefersStill(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const connection = (navigator as NetworkNavigator).connection;
  return (
    Boolean(connection?.saveData) ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g"
  );
}

/** Följer inställningen för minskad rörelse medan sidan är öppen. */
function subscribeToMotion(onChange: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  motion.addEventListener("change", onChange);
  return () => motion.removeEventListener("change", onChange);
}

/** Bildpositionen som CSS-variabler – .hero-reel-layer i globals.css väljer mobil eller bred skärm. */
function layerPosition(clip: HeroClip): CSSProperties {
  return {
    "--hero-pos": clip.position,
    "--hero-pos-mobile": clip.mobilePosition,
  } as CSSProperties;
}

export function HeroReel({ reel }: { reel: HeroReelConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // Film eller stillbild. Läses i webbläsaren – på servern blir det stillbild.
  const enabled = useSyncExternalStore(
    subscribeToMotion,
    () => !prefersStill(),
    () => false,
  );

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    const videos = videoRefs.current.filter((v): v is HTMLVideoElement => v !== null);
    if (!container || videos.length === 0 || videos.length !== reel.clips.length) return;

    const controller = new AbortController();
    const { signal } = controller;
    const prepared = new Map<number, Promise<void>>();
    const waiters: (() => void)[] = [];
    let active = 0;
    let incoming: number | null = null;
    let phase: Phase = "starting";
    let fade: Animation | null = null;
    let fadeGuard = 0;
    let stalled = false;
    let trigger = 0;
    let inView = true;

    const shouldRun = () => !document.hidden && inView;

    // Läget syns i DOM:en (data-phase, data-active) – skrivs bara vid byten.
    function setPhase(next: Phase) {
      phase = next;
      container!.dataset.phase = next;
    }

    function waitFor(
      video: HTMLVideoElement,
      event: string,
      ready: () => boolean,
      timeoutMs = 15000,
    ): Promise<void> {
      if (signal.aborted) return Promise.reject(new Error("avbruten"));
      if (ready()) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => finish(new Error("tog för lång tid")), timeoutMs);
        const check = () => {
          if (ready()) finish();
        };
        const fail = () => finish(new Error("kunde inte spelas"));
        const abort = () => finish(new Error("avbruten"));
        function finish(error?: Error) {
          window.clearTimeout(timer);
          video.removeEventListener(event, check);
          video.removeEventListener("error", fail);
          signal.removeEventListener("abort", abort);
          if (error) reject(error);
          else resolve();
        }
        video.addEventListener(event, check);
        video.addEventListener("error", fail);
        signal.addEventListener("abort", abort);
      });
    }

    /** Resolvas när rullen får spela – direkt, eller när pausen släpps. */
    function whenRunning(): Promise<void> {
      if (shouldRun()) return Promise.resolve();
      return new Promise((resolve) => waiters.push(resolve));
    }

    /** Laddar klippet och spolar det till början, utan att visa det. */
    function prepare(index: number): Promise<void> {
      const existing = prepared.get(index);
      if (existing) return existing;
      const video = videos[index];
      const clip = reel.clips[index];
      // Sätt även DOM-egenskaperna före src för ljudlös inline-video på iOS.
      video.controls = false;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      const promise = (async () => {
        if (video.getAttribute("src") !== clip.src) {
          video.preload = "auto";
          video.src = clip.src;
          video.load();
        }
        await waitFor(video, "loadedmetadata", () => video.readyState >= HTMLMediaElement.HAVE_METADATA);
        video.pause();
        if (video.currentTime > 0) {
          video.currentTime = 0;
          await waitFor(video, "seeked", () => !video.seeking);
        }
        await waitFor(video, "canplay", () => video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA);
      })();
      prepared.set(index, promise);
      promise.catch(() => prepared.delete(index));
      return promise;
    }

    /** Startar ett förberett klipp och väntar in dess första visade bildruta. */
    async function startClip(video: HTMLVideoElement) {
      await video.play();
      if ("requestVideoFrameCallback" in video) {
        await new Promise<void>((resolve) => {
          const timer = window.setTimeout(resolve, 250);
          video.requestVideoFrameCallback(() => {
            window.clearTimeout(timer);
            resolve();
          });
        });
      }
    }

    /** Tonar in ett lager ovanpå det som syns. Det undre rörs inte. */
    async function fadeIn(video: HTMLVideoElement) {
      fade = video.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: reel.crossfade * 1000,
        easing: "ease-in-out",
        fill: "forwards",
      });
      if (!shouldRun() || stalled) fade.pause();
      else guardFade();
      try {
        await fade.finished;
      } finally {
        unguardFade();
      }
      video.style.opacity = "1";
      fade.cancel();
      fade = null;
    }

    /**
     * En toning drivs av webbläsarens bildrutor. Ritas inga (t.ex. i en dold
     * förhandsvisning som ändå räknas som synlig) står den still, och rullen
     * med den. Den här timern avslutar toningen när tiden har gått, så att
     * rullen håller takten ändå. Den pausas och startas med toningen.
     */
    function guardFade() {
      unguardFade();
      if (!fade || fade.playState !== "running") return;
      const elapsed = Number(fade.currentTime ?? 0);
      const left = Math.max(0, reel.crossfade * 1000 - elapsed);
      fadeGuard = window.setTimeout(() => {
        fadeGuard = 0;
        if (fade?.playState === "running") fade.finish();
      }, left + 50);
    }

    function unguardFade() {
      if (fadeGuard) window.clearTimeout(fadeGuard);
      fadeGuard = 0;
    }

    function pauseFade() {
      fade?.pause();
      unguardFade();
    }

    function resumeFade() {
      if (!fade) return;
      fade.play();
      guardFade();
    }

    // Buffrar det inkommande klippet står toningen still – det utgående lagret
    // ligger kvar helt synligt under tiden.
    const onWaiting = () => {
      stalled = true;
      pauseFade();
    };
    const onPlaying = () => {
      stalled = false;
      if (shouldRun()) resumeFade();
    };

    function stop() {
      setPhase("stopped");
      clearTrigger();
    }

    /** Klippets längd: filens egen, men aldrig längre än konfigurationens. */
    function clipLength(index: number): number {
      const video = videos[index];
      const configured = reel.clips[index].duration;
      return Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(configured, video.duration)
        : configured;
    }

    function clearTrigger() {
      if (trigger) window.clearTimeout(trigger);
      trigger = 0;
    }

    /**
     * Ställer en timer till när nästa klipp ska tona in: toningens längd före
     * slutet. En timer räknad på klippets position – inte en loop per
     * bildruta – håller tiden även när webbläsaren glesar ut bildrutorna.
     * Har klippet buffrat och ligger efter, ställs timern om.
     */
    function scheduleTrigger() {
      clearTrigger();
      if (phase !== "playing" || !shouldRun()) return;
      const video = videos[active];
      const left = clipLength(active) - reel.crossfade - video.currentTime;
      if (left <= 0.02 || video.ended) {
        void transition();
        return;
      }
      trigger = window.setTimeout(() => {
        trigger = 0;
        scheduleTrigger();
      }, (left * 1000) / (video.playbackRate || 1));
    }

    async function begin() {
      try {
        await prepare(0);
        await whenRunning();
        if (signal.aborted) return;
        prepared.delete(0);
        const first = videos[0];
        first.style.zIndex = "1";
        await startClip(first);
        if (signal.aborted) return;
        await fadeIn(first);
        if (signal.aborted) return;
        active = 0;
        container!.dataset.active = "0";
        setPhase("playing");
        scheduleTrigger();
        void prepare(1 % videos.length).catch(() => {});
      } catch {
        // Första klippet gick inte att spela: stillbilden ligger kvar.
        if (!signal.aborted) {
          for (const video of videos) {
            video.pause();
            video.style.visibility = "hidden";
          }
          stop();
        }
      }
    }

    async function transition() {
      if (phase !== "playing") return;
      clearTrigger();
      const next = (active + 1) % videos.length;
      setPhase("preparing");
      try {
        await prepare(next);
        await whenRunning();
        if (signal.aborted) return;
        prepared.delete(next);
        const outgoing = videos[active];
        const inbound = videos[next];
        outgoing.style.zIndex = "1";
        inbound.style.zIndex = "2";
        incoming = next;
        await startClip(inbound);
        if (signal.aborted) return;
        if (!shouldRun()) inbound.pause();
        setPhase("fading");
        stalled = false;
        inbound.addEventListener("waiting", onWaiting);
        inbound.addEventListener("playing", onPlaying);
        try {
          await fadeIn(inbound);
        } finally {
          inbound.removeEventListener("waiting", onWaiting);
          inbound.removeEventListener("playing", onPlaying);
        }
        if (signal.aborted) return;
        // Det nya lagret är helt synligt – nu göms det gamla bakom.
        outgoing.pause();
        outgoing.style.opacity = "0";
        outgoing.style.zIndex = "0";
        inbound.style.zIndex = "1";
        active = next;
        incoming = null;
        container!.dataset.active = String(active);
        setPhase("playing");
        scheduleTrigger();
        void prepare((active + 1) % videos.length).catch(() => {});
      } catch {
        // Nästa klipp gick inte att spela: den synliga bilden ligger kvar.
        if (!signal.aborted) stop();
      }
    }

    // Reserv om timern skulle komma för sent: när det synliga klippet tar slut
    // börjar övergången direkt. Bilden står kvar på sista bildrutan tills dess.
    for (const video of videos) {
      video.addEventListener(
        "ended",
        () => {
          if (video === videos[active] && phase === "playing" && shouldRun()) {
            void transition();
          }
        },
        { signal },
      );
    }

    /** Spelar eller pausar efter flikens och herons synlighet. */
    function sync() {
      if (signal.aborted) return;
      if (!shouldRun()) {
        for (const video of videos) video.pause();
        pauseFade();
        clearTrigger();
        return;
      }
      if (phase === "playing" || phase === "preparing" || phase === "fading") {
        // Ett klipp som redan har spelat klart får inte börja om.
        const current = videos[active];
        if (!current.ended) void current.play().catch(() => {});
      }
      if (phase === "fading" && incoming !== null) {
        void videos[incoming].play().catch(() => {});
        if (!stalled) resumeFade();
      }
      while (waiters.length > 0) waiters.shift()!();
      // Uppspelningen kommer igång en bråkdel senare – timern ställs när den gör det.
      if (phase === "playing") {
        const current = videos[active];
        if (current.paused && !current.ended) {
          current.addEventListener("playing", scheduleTrigger, { once: true, signal });
        } else {
          scheduleTrigger();
        }
      }
    }

    document.addEventListener("visibilitychange", sync, { signal });
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(container);

    void begin();

    return () => {
      controller.abort();
      observer.disconnect();
      clearTrigger();
      unguardFade();
      fade?.cancel();
      for (const video of videos) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.style.opacity = "0";
        video.style.zIndex = "";
        video.style.visibility = "";
      }
      delete container.dataset.phase;
      delete container.dataset.active;
    };
  }, [enabled, reel]);


  return (
    <>
      {/* isolate: lagrens z-index gäller bara inom rullen, så att toningen
          (.hero-scrim) och texten i headern alltid ligger ovanpå filmen. */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 isolate overflow-hidden"
      >
        {/* Stillbild ur första klippet: syns före filmen, utan JavaScript och
            vid minskad rörelse. */}
        <Image
          src={reel.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-reel-layer object-cover"
          style={layerPosition(reel.clips[0])}
        />
        {reel.clips.map((clip, index) => (
          <video
            key={clip.src}
            ref={(element) => {
              videoRefs.current[index] = element;
            }}
            className="hero-background-video hero-reel-layer pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ ...layerPosition(clip), opacity: 0 }}
            autoPlay={index === 0}
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            tabIndex={-1}
            {...{ "webkit-playsinline": "true", "x-webkit-airplay": "deny" }}
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
          />
        ))}
      </div>

    </>
  );
}
