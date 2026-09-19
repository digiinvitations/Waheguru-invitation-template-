import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { WeddingData } from '../types';
import { IkOnkarSymbol } from './IkOnkarSymbol';

interface PreloaderProps {
  data: WeddingData;
  onComplete: () => void;
}

// Module-level persistent cache so the browser retains buffered streams across component unmounts
const persistentMediaCache = new Set<HTMLVideoElement | HTMLAudioElement>();

export function Preloader({ data, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Preparing Celebration...");
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      // 1. Collect all images
      const images: string[] = [];
      if (data.openingThumbnailUrl) images.push(data.openingThumbnailUrl);
      if (data.openingQuoteBgUrl) images.push(data.openingQuoteBgUrl);
      if (data.heroLogoUrl) images.push(data.heroLogoUrl);
      if (data.ogImageUrl) images.push(data.ogImageUrl);
      images.push("/ikonkar-gold.svg");

      if (data.gallery && Array.isArray(data.gallery)) {
        data.gallery.forEach((g) => {
          if (g && typeof g === "string") images.push(g);
        });
      }

      if (data.events && Array.isArray(data.events)) {
        data.events.forEach((ev) => {
          if (ev.image) images.push(ev.image);
        });
      }

      // 2. Collect all videos
      const videos: string[] = [];
      if (data.openingVideoUrl) videos.push(data.openingVideoUrl);
      if (data.heroVideoUrl) videos.push(data.heroVideoUrl);

      if (data.events && Array.isArray(data.events)) {
        data.events.forEach((ev) => {
          if (ev.videoUrl) videos.push(ev.videoUrl);
        });
      }

      // 3. Collect all audio
      const audios: string[] = [];
      if (data.openingMusicUrl) audios.push(data.openingMusicUrl);
      if (data.musicUrl) audios.push(data.musicUrl);

      // Deduplicate URLs
      const uniqueImages = Array.from(new Set(images.filter(Boolean)));
      const uniqueVideos = Array.from(new Set(videos.filter(Boolean)));
      const uniqueAudios = Array.from(new Set(audios.filter(Boolean)));

      const totalItems = uniqueImages.length + uniqueVideos.length + uniqueAudios.length + 1; // +1 for fonts

      let loadedCount = 0;
      const step = (msg?: string) => {
        loadedCount++;
        if (isMounted) {
          const pct = Math.min(100, Math.round((loadedCount / totalItems) * 100));
          setProgress(pct);
          if (msg) setStatusMessage(msg);
        }
      };

      // Helper to preload an image and decode it into memory
      const preloadImg = (url: string): Promise<void> => {
        return new Promise((resolve) => {
          // Check if it's already in the DOM (e.g. data-opening-thumbnail)
          const existingImg = document.querySelector(`img[src="${url}"]`) as HTMLImageElement;
          if (existingImg && existingImg.complete) {
            step("Loading Visuals...");
            resolve();
            return;
          }

          const img = new Image();
          let done = false;
          const finish = () => {
            if (!done) {
              done = true;
              step("Loading Visuals...");
              resolve();
            }
          };

          img.onload = () => {
            if ("decode" in img) {
              img.decode().then(finish).catch(finish);
            } else {
              finish();
            }
          };
          img.onerror = finish;
          img.src = url;

          if (img.complete) {
            finish();
          }

          // Safety timeout per image
          setTimeout(finish, 5000);
        });
      };

      // Helper to preload video element and buffer initial frames
      const preloadVid = (url: string, isOpening = false): Promise<void> => {
        return new Promise((resolve) => {
          // Look for live DOM video element (e.g., data-opening-video)
          let video: HTMLVideoElement | null = null;
          if (isOpening) {
            video = document.querySelector('video[data-opening-video="true"]');
          }
          if (!video) {
            video = document.querySelector(`video[src="${url}"]`);
          }
          if (!video) {
            video = document.createElement("video");
            video.preload = "auto";
            video.muted = true;
            video.playsInline = true;
            video.src = url;
          }

          persistentMediaCache.add(video);

          let done = false;
          const finish = () => {
            if (!done) {
              done = true;
              cleanup();
              step(isOpening ? "Readying Opening Video..." : "Buffering Celebration Videos...");
              resolve();
            }
          };

          const cleanup = () => {
            if (video) {
              video.removeEventListener("loadeddata", finish);
              video.removeEventListener("canplay", finish);
              video.removeEventListener("canplaythrough", finish);
              video.removeEventListener("error", finish);
            }
          };

          if (video.readyState >= 2) {
            finish();
            return;
          }

          video.addEventListener("loadeddata", finish, { once: true });
          video.addEventListener("canplay", finish, { once: true });
          video.addEventListener("canplaythrough", finish, { once: true });
          video.addEventListener("error", finish, { once: true });

          // Also attempt fetch in parallel so the browser caches the raw bytes
          fetch(url, { mode: "no-cors", cache: "force-cache" }).catch(() => {});

          try {
            video.load();
          } catch (e) {}

          // Safety timeout per video
          setTimeout(finish, isOpening ? 9000 : 7000);
        });
      };

      // Helper to preload audio
      const preloadAud = (url: string): Promise<void> => {
        return new Promise((resolve) => {
          const audio = new Audio();
          audio.preload = "auto";
          persistentMediaCache.add(audio);

          let done = false;
          const finish = () => {
            if (!done) {
              done = true;
              cleanup();
              step("Preparing Sacred Music...");
              resolve();
            }
          };

          const cleanup = () => {
            audio.removeEventListener("loadeddata", finish);
            audio.removeEventListener("canplay", finish);
            audio.removeEventListener("canplaythrough", finish);
            audio.removeEventListener("error", finish);
          };

          if (audio.readyState >= 2) {
            finish();
            return;
          }

          audio.addEventListener("loadeddata", finish, { once: true });
          audio.addEventListener("canplay", finish, { once: true });
          audio.addEventListener("canplaythrough", finish, { once: true });
          audio.addEventListener("error", finish, { once: true });

          audio.src = url;
          try {
            audio.load();
          } catch (e) {}

          setTimeout(finish, 6000);
        });
      };

      // Fonts preloading
      const fontsPromise = (document.fonts ? document.fonts.ready : Promise.resolve())
        .then(() => {
          step("Rasterizing Sacred Fonts...");
        })
        .catch(() => {
          step();
        });

      // Prioritize Opening assets first
      const openingAssetsPromises: Promise<void>[] = [];
      if (data.openingThumbnailUrl) {
        openingAssetsPromises.push(preloadImg(data.openingThumbnailUrl));
      }
      if (data.openingVideoUrl) {
        openingAssetsPromises.push(preloadVid(data.openingVideoUrl, true));
      }

      // Other media promises
      const otherImages = uniqueImages.filter((u) => u !== data.openingThumbnailUrl);
      const otherVideos = uniqueVideos.filter((u) => u !== data.openingVideoUrl);

      const allPromises = [
        ...openingAssetsPromises,
        ...otherImages.map(preloadImg),
        ...otherVideos.map((v) => preloadVid(v, false)),
        ...uniqueAudios.map(preloadAud),
        fontsPromise,
      ];

      // Master timeout: max 12 seconds so visitors on slow connections never freeze
      const masterTimeout = new Promise<void>((resolve) => setTimeout(resolve, 12000));

      await Promise.race([Promise.all(allPromises), masterTimeout]);

      if (isMounted) {
        setProgress(100);
        setStatusMessage("Ready • Waheguru Ji Mehar Karan");
        setTimeout(() => {
          if (isMounted) {
            setIsFadingOut(true);
            setTimeout(() => {
              if (isMounted) onComplete();
            }, 400);
          }
        }, 500);
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [data, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-blush-main px-6 select-none transition-opacity duration-400 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <motion.div 
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mb-6 flex flex-col items-center"
      >
        <IkOnkarSymbol 
          customLogoUrl={data.heroLogoUrl}
          className="h-20 sm:h-24 w-auto max-w-[180px] object-contain drop-shadow-md select-none"
        />
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-wine-dark/80 font-serif font-bold mt-3">
          Ik Onkar • Satgur Prasad
        </span>
      </motion.div>

      <div className="w-full max-w-xs">
        <div className="h-1.5 w-full bg-pink-border/40 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-pink-accent to-burgundy rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 px-0.5">
          <p className="text-wine-dark/75 font-serif text-[10px] uppercase tracking-widest font-semibold">
            {statusMessage}
          </p>
          <span className="text-burgundy font-serif text-[11px] font-bold">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
