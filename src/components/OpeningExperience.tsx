import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WeddingData } from "../types";
import { IkOnkarSymbol } from "./IkOnkarSymbol";
import { ArrowRight, Sparkles, Heart } from "lucide-react";

interface OpeningExperienceProps {
  data: WeddingData;
  onComplete: () => void;
}

export function OpeningExperience({ data, onComplete }: OpeningExperienceProps) {
  const [stage, setStage] = useState<"thumbnail" | "video" | "quote">("thumbnail");
  const [songProgress, setSongProgress] = useState(0); // 0 to 100
  const [quoteRevealed, setQuoteRevealed] = useState(false);

  const openingAudioRef = useRef<HTMLAudioElement | null>(null);
  const openingVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioStartedRef = useRef(false);
  const completedRef = useRef(false);

  const omkarLogo = data.heroLogoUrl || "/src/assets/ikonkar-gold.svg";
  const openingAudioUrl = data.openingMusicUrl || data.musicUrl;

  // Gracefully transition to the main website
  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;

    if (openingAudioRef.current) {
      try {
        openingAudioRef.current.pause();
      } catch (e) {}
    }
    onComplete();
  };

  // Initialize opening audio element
  useEffect(() => {
    if (!openingAudioUrl) return;

    const audio = new Audio(openingAudioUrl);
    audio.preload = "auto";
    audio.loop = false;
    openingAudioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        const pct = Math.min(100, Math.round((audio.currentTime / audio.duration) * 100));
        setSongProgress(pct);

        // When song ends (within 0.3s of duration), automatically finish and redirect to real website
        if (audio.currentTime >= audio.duration - 0.3) {
          handleFinish();
        }
      }
    };

    const handleEnded = () => {
      setSongProgress(100);
      handleFinish();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.removeAttribute("src");
    };
  }, [openingAudioUrl]);

  // User taps the thumbnail - instant cut to video with NO transition
  const handleStart = () => {
    // 1. Start opening background music
    if (openingAudioRef.current && !audioStartedRef.current) {
      audioStartedRef.current = true;
      openingAudioRef.current.play().catch((err) => {
        console.warn("Opening audio autoplay prevented", err);
      });
    }

    // 2. Full opening video appears immediately with zero transition
    if (data.openingVideoUrl) {
      setStage("video");
      if (openingVideoRef.current) {
        openingVideoRef.current.currentTime = 0;
        openingVideoRef.current.play().catch(() => {});
      }
    } else {
      setStage("quote");
    }
  };

  // When opening video ends, transition to quote page
  const handleVideoEnded = () => {
    setStage("quote");
  };

  // In quote stage: reveal quote text and monitor song end
  useEffect(() => {
    if (stage === "quote") {
      const timer = setTimeout(() => {
        setQuoteRevealed(true);
      }, 300);

      // Fallback if audio fails or is paused
      const fallbackTimer = setTimeout(() => {
        if (!openingAudioRef.current || openingAudioRef.current.error || openingAudioRef.current.paused) {
          handleFinish();
        }
      }, 12000);

      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center select-none overflow-hidden">
      {/* ================= STAGES 1 & 2: THUMBNAIL & VIDEO (ZERO TRANSITION ANIMATION & MATCHED THEME) ================= */}
      {stage !== "quote" && (
        <div className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden">
          {/* Opening Video Element - Preloaded with Opening Thumbnail Poster for Matched Theme */}
          {data.openingVideoUrl && (
            <video
              ref={openingVideoRef}
              data-opening-video="true"
              src={data.openingVideoUrl}
              poster={data.openingThumbnailUrl}
              playsInline
              muted
              preload="auto"
              onEnded={handleVideoEnded}
              className={`absolute inset-0 w-full h-full object-contain bg-white ${
                stage === "video" ? "z-10 block" : "z-0 pointer-events-none"
              }`}
            />
          )}

          {/* STAGE 1: THUMBNAIL (Matches exact same container, size, and white background) */}
          {stage === "thumbnail" && (
            <div
              onClick={handleStart}
              className="absolute inset-0 z-20 w-full h-full flex flex-col items-center justify-center cursor-pointer bg-white overflow-hidden"
            >
              {/* Pure Thumbnail Image with NO background shades or dark tints */}
              {data.openingThumbnailUrl ? (
                <img
                  data-opening-thumbnail="true"
                  src={data.openingThumbnailUrl}
                  alt="Wedding Invitation Opening"
                  loading="eager"
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white" />
              )}

              {/* Tap to Open Prompt at Bottom */}
              <div className="absolute bottom-8 z-30 flex flex-col items-center animate-pulse">
                <div className="px-5 py-2.5 rounded-full bg-white/95 border border-pink-border shadow-xs flex items-center gap-2 text-wine-dark font-serif text-xs uppercase tracking-widest font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-pink-accent animate-spin" style={{ animationDuration: "6s" }} />
                  <span>Tap to Open Invitation</span>
                  <Heart className="w-3.5 h-3.5 text-burgundy fill-burgundy" />
                </div>
              </div>
            </div>
          )}

          {/* Top Ik Onkar Header - 100% IDENTICAL ACROSS BOTH THUMBNAIL & VIDEO STAGES */}
          <div className="absolute top-6 sm:top-8 inset-x-0 flex flex-col items-center pointer-events-none z-30">
            <div className="flex flex-col items-center">
              <IkOnkarSymbol
                customLogoUrl={data.heroLogoUrl}
                className="h-16 sm:h-20 w-auto max-w-[150px] object-contain select-none"
              />
              <span className="text-[10.5px] uppercase tracking-[0.25em] text-wine-dark font-serif font-bold mt-1.5">
                Ik Onkar • Satgur Prasad
              </span>
            </div>
          </div>

          {/* Skip Video button (Only during video playback) */}
          {stage === "video" && (
            <button
              onClick={handleVideoEnded}
              className="absolute top-6 right-6 z-40 px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-wine-dark font-serif text-[10px] uppercase tracking-widest font-bold border border-pink-border shadow-xs transition-colors cursor-pointer"
            >
              Skip Video
            </button>
          )}
        </div>
      )}

      {/* ================= STAGE 3: QUOTE PAGE (CAN HAVE OPTIONAL BG IMAGE) ================= */}
      <AnimatePresence>
        {stage === "quote" && (
          <motion.div
            key="quote-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-full flex flex-col items-center justify-center px-6 text-center bg-white overflow-hidden"
          >
            {/* User-Configured Background Image for Quote Page (if provided) */}
            {data.openingQuoteBgUrl && (
              <div className="absolute inset-0 pointer-events-none z-0">
                <img
                  src={data.openingQuoteBgUrl}
                  alt="Quote Page Background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/35 backdrop-blur-[0.5px]" />
              </div>
            )}

            {/* Omkar Icon with Text Aligned at TOP */}
            <div className="absolute top-8 sm:top-10 inset-x-0 flex flex-col items-center pointer-events-none z-20">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
                <img
                  src={omkarLogo}
                  alt="Ik Onkar"
                  className="h-16 sm:h-20 w-auto max-w-[150px] object-contain select-none"
                />
                <span className="text-[10.5px] uppercase tracking-[0.25em] text-wine-dark font-serif font-bold mt-1.5">
                  Ik Onkar • Satgur Prasad
                </span>
              </motion.div>
            </div>

            {/* Sacred Gurmukhi Quote in Center of Page */}
            <div className="relative z-10 max-w-sm flex flex-col items-center pt-16">
              {/* Subtle divider */}
              <div className="flex items-center justify-center gap-2 mb-6 w-32">
                <div className="h-[1px] flex-1 bg-pink-accent/40" />
                <Heart className="w-3.5 h-3.5 text-burgundy fill-burgundy opacity-70" />
                <div className="h-[1px] flex-1 bg-pink-accent/40" />
              </div>

              <div className="space-y-3 min-h-[110px] flex flex-col items-center justify-center">
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={
                    quoteRevealed
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 12 }
                  }
                  transition={{ duration: 1.0, ease: "easeOut" }}
                  className="font-serif text-xl sm:text-2xl font-bold text-burgundy leading-relaxed tracking-wide"
                >
                  ਹਰਿ ਪ੍ਰਭੁ ਕਾਜੁ ਰਚਾਇਆ ॥
                </motion.h2>

                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={
                    quoteRevealed
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 12 }
                  }
                  transition={{ duration: 1.0, delay: 0.6, ease: "easeOut" }}
                  className="font-serif text-xl sm:text-2xl font-bold text-burgundy leading-relaxed tracking-wide"
                >
                  ਗੁਰਮੁਖਿ ਵੀਆਹਣੁ ਆਇਆ ॥
                </motion.h2>

                {/* English Spiritual Meaning - Sized up for clear readability */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={quoteRevealed ? { opacity: 0.95 } : { opacity: 0 }}
                  transition={{ duration: 1.0, delay: 1.2 }}
                  className="font-serif text-sm sm:text-base italic text-wine-dark/90 max-w-sm leading-relaxed pt-2 font-medium"
                >
                  “God has solemnized this sacred union; by the Guru’s grace, the blessed wedding day has arrived.”
                </motion.p>
              </div>

              {/* Progress of the Opening Song */}
              {songProgress > 0 && (
                <div className="w-36 mt-8 flex flex-col items-center gap-1.5">
                  <div className="w-full h-1 bg-pink-border/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-pink-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${songProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[9px] font-serif uppercase tracking-widest text-wine-dark/60">
                    Entering Celebration...
                  </span>
                </div>
              )}

              {/* Manual Enter Wedding Button */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
                onClick={handleFinish}
                className="mt-8 px-6 py-2.5 rounded-full bg-white border border-pink-accent/60 shadow-xs text-wine-dark font-serif text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-blush-light active:scale-95 transition-all cursor-pointer"
              >
                <span>Enter Wedding</span>
                <ArrowRight className="w-3.5 h-3.5 text-pink-accent" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
