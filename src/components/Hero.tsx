import { motion } from "motion/react";
import { Heart, ArrowDown } from "lucide-react";
import { WeddingData } from "../types";
import { useState, useRef, useEffect } from "react";

interface HeroProps {
  data: WeddingData;
  shouldPlayVideo?: boolean;
  onVideoEnd?: () => void;
}

export function Hero({ data, shouldPlayVideo = true, onVideoEnd }: HeroProps) {
  const [showText, setShowText] = useState(!data.heroVideoUrl);
  const [isEnded, setIsEnded] = useState(!data.heroVideoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (shouldPlayVideo && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [shouldPlayVideo]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime } = videoRef.current;
      if (currentTime >= 2) {
        if (!showText) setShowText(true);
      }
    }
  };

  const handleEnded = () => {
    setIsEnded(true);
    setShowText(true);
    if (onVideoEnd) onVideoEnd();
  };

  return (
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Background Video or Image */}
      <div className="absolute inset-0 z-0 bg-white">
        {data.heroVideoUrl ? (
          <video
            ref={videoRef}
            src={data.heroVideoUrl}
            muted
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')" }}
          />
        )}
        
        {/* Dynamic White Shade Overlay */}
        <div className={`absolute inset-0 bg-white/40 backdrop-blur-[0.5px] transition-opacity duration-1000 ${data.heroVideoUrl && !showText ? 'opacity-0' : 'opacity-100'}`} />
        
        {/* Soft luminous white veil when video ends / text appears */}
        {data.heroVideoUrl && (
          <div className={`absolute inset-0 bg-gradient-to-b from-white/60 via-white/70 to-white/90 transition-opacity duration-1000 ${isEnded ? 'opacity-100' : 'opacity-0'}`} />
        )}

        {/* White bottom gradient blending into the next section */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t pointer-events-none transition-colors duration-1000 from-white via-white/80 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center px-6 text-center w-full max-w-md mx-auto pt-12 pb-6 h-full min-h-[100svh] transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full mt-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 10 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-center w-full"
          >
            {/* Sacred Sikh Invocation / Background-Removed Religious Logo */}
            <div className="flex flex-col items-center mb-4">
              {data.heroLogoUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={data.heroLogoUrl}
                    alt="Waheguru / Sacred Logo"
                    className="h-16 md:h-20 w-auto max-w-[200px] object-contain drop-shadow-md select-none pointer-events-none transition-transform duration-300"
                  />
                  <span className="text-[10px] tracking-[0.25em] uppercase text-wine-dark/85 font-serif mt-1.5 font-bold">
                    Ik Onkar • Satgur Prasad
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-4xl text-wine-dark font-serif font-bold tracking-wider drop-shadow-sm select-none">
                    ੴ
                  </span>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-wine-dark/85 font-serif mt-1 font-bold">
                    Ik Onkar • Satgur Prasad
                  </span>
                </>
              )}
            </div>

            {/* Elder / Grandmother's Invitation Callout */}
            <div className="mb-3.5 px-4 py-1.5 rounded-full bg-white/95 border border-pink-border shadow-2xs backdrop-blur-xs flex items-center justify-center">
              <span className="text-[11px] sm:text-xs font-serif font-bold text-burgundy tracking-wider uppercase">
                Invitation by {data.invitedBy || "Grandmother Sdn. Jasmer Kaur"}
              </span>
            </div>

            <p className="font-serif text-wine-dark text-[14px] italic mb-4 max-w-[300px] leading-relaxed font-normal opacity-95 whitespace-pre-line drop-shadow-2xs">
              {data.heroMessage}
            </p>
            
            <div className="flex items-center justify-center gap-3 opacity-60 mb-6">
              <div className="h-[1px] w-12 bg-wine-dark"></div>
              <Heart className="w-3 h-3 text-wine-dark fill-wine-dark" />
              <div className="h-[1px] w-12 bg-wine-dark"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: showText ? 1 : 0, scale: showText ? 1 : 0.95 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <h1 className="font-script text-6xl text-wine-dark drop-shadow-sm leading-none">
              {data.groom.name}
            </h1>
            <div className="font-serif text-[12px] text-wine-dark/85 flex flex-col items-center gap-1 mt-2 mb-5 font-normal">
              <p>{data.groom.parents}</p>
              {data.groom.education && <p>{data.groom.education}</p>}
              {data.groom.profession && <p>{data.groom.profession}</p>}
            </div>
            
            <span className="font-script text-3xl text-pink-accent my-1">&amp;</span>
            
            <h1 className="font-script text-6xl text-wine-dark drop-shadow-sm leading-none mt-3">
              {data.bride.name}
            </h1>
            <div className="font-serif text-[12px] text-wine-dark/85 flex flex-col items-center gap-1 mt-2 font-normal">
              <p>{data.bride.parents}</p>
              {data.bride.education && <p>{data.bride.education}</p>}
              {data.bride.profession && <p>{data.bride.profession}</p>}
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showText ? 0.85 : 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-6 flex flex-col items-center"
        >
          <span className="text-[10px] font-serif text-wine-dark uppercase tracking-[0.3em] mb-2 font-semibold">Scroll</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-4 h-4 text-wine-dark" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
