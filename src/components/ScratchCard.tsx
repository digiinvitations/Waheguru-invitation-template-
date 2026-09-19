import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { generateIcsFile } from "../utils";
import { WeddingData } from "../types";
import { Calendar, Heart, MapPin } from "lucide-react";
import confetti from "canvas-confetti";

interface ScratchCardProps {
  data: WeddingData;
  onReveal?: () => void;
}

const heartMaskStyle = {
  WebkitMaskImage: `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjUgMiA1LjQyIDQuNDIgMyA3LjUgM2MxLjc0IDAgMy40MS44MSA0LjUgMi4wOUMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzIDE5LjU4IDMgMjIgNS40MiAyMiA4LjVjMCAzLjc4LTMuNCA2Ljg2LTguNTUgMTEuNTRMMTIgMjEuMzV6IiBmaWxsPSJibGFjayIvPjwvc3ZnPg==")`,
  WebkitMaskSize: "contain",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjUgMiA1LjQyIDQuNDIgMyA3LjUgM2MxLjc0IDAgMy40MS44MSA0LjUgMi4wOUMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzIDE5LjU4IDMgMjIgNS40MiAyMiA4LjVjMCAzLjc4LTMuNCA2Ljg2LTguNTUgMTEuNTRMMTIgMjEuMzV6IiBmaWxsPSJibGFjayIvPjwvc3ZnPg==")`,
  maskSize: "contain",
  maskPosition: "center",
  maskRepeat: "no-repeat"
};

export function ScratchCardSection({ data, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const venueName = data.venue?.name || "Gurudwara Shri Guru Singh Sabha";
  const venueAddress = [data.venue?.addressLine1, data.venue?.addressLine2].filter(Boolean).join(", ");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    setContext(ctx);

    // Setup canvas size matching the heart dimensions
    const width = 340;
    const height = 340;
    canvas.width = width;
    canvas.height = height;

    drawScratchLayer(ctx, width, height);
  }, []);

  const drawScratchLayer = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Fill canvas with rich pink/burgundy gradient - the CSS mask clips it into a heart
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#E5A9B8"); // Rich dusty blush
    gradient.addColorStop(0.4, "#C9788D"); // Muted dusty rose
    gradient.addColorStop(1, "#8F1736"); // Deep burgundy/rose
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add fine sparkling glitter effect across the heart uniformly
    for (let i = 0; i < 16000; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255, 255, 255, 0.95)" : "rgba(244, 221, 226, 0.85)";
      ctx.fillRect(rx, ry, Math.random() * 1.5 + 0.5, Math.random() * 1.5 + 0.5);
    }
    
    // Add slightly larger distinct sparkles
    for (let i = 0; i < 350; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.beginPath();
      ctx.arc(rx, ry, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shimmering scratch prompt on unrevealed heart surface
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = "bold 13px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ Scratch Here ✨", width / 2, height / 2 + 10);
    ctx.restore();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;
    setIsDrawing(true);
    scratch(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    checkReveal();
  };

  const scratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context || !canvasRef.current || isRevealed) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 28, 0, Math.PI * 2);
    context.fill();
  };

  const checkReveal = () => {
    if (!context || !canvasRef.current || isRevealed) return;
    const canvas = canvasRef.current;
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;
    
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }
    
    const totalPixelsChecked = pixels.length / 16;
    const scratchedPercentage = transparentCount / totalPixelsChecked;

    if (scratchedPercentage > 0.22) {
      // Clear entire canvas to fully reveal
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fire celebration confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#A92543', '#D9A6B2', '#F4DDE2', '#ffffff'],
        disableForReducedMotion: true,
        zIndex: 9999
      });
      
      if (onReveal) {
        onReveal();
      }
      setIsRevealed(true);
    }
  };

  return (
    <section className="py-16 px-4 bg-[#F8E8EB] flex flex-col items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <h2 className="font-script text-4xl text-[#A92543] text-center">
          Scratch to Reveal
        </h2>
        
        <div className="flex items-center justify-center w-full gap-4 mt-6">
          <div className="h-[1px] w-16 bg-[#D9A6B2] opacity-60"></div>
          <Heart className="w-4 h-4 text-[#A92543] fill-[#A92543] opacity-80" />
          <div className="h-[1px] w-16 bg-[#D9A6B2] opacity-60"></div>
        </div>

        {/* The Mask Container ensures both the scratch layer and the content underneath are perfect hearts */}
        <div 
          className="relative mt-8 mb-6 w-[340px] h-[340px] max-w-[92vw] aspect-square" 
          ref={containerRef}
          style={heartMaskStyle}
        >
          {/* Base background of the revealed heart */}
          <div className="absolute inset-0 bg-[#F4DDE2]" />

          {/* Safe zone container: situated between 23% and 72% height, safely clear of top cleft and bottom taper */}
          <div className="absolute inset-x-0 top-[23%] bottom-[27%] flex flex-col items-center justify-center text-center px-4 select-none">
            {/* Sacred Ek Onkar Logo */}
            <span className="text-2xl sm:text-[28px] text-[#8F1736] font-serif font-bold leading-none mb-1 drop-shadow-2xs">
              ੴ
            </span>

            {/* Ceremony Tag */}
            <p className="font-serif text-[11px] sm:text-xs uppercase tracking-[0.24em] text-[#8F1736] font-bold">
              Anand Karaj
            </p>

            {/* Wedding Date */}
            <p className="font-serif font-bold text-xl sm:text-2xl text-[#8F1736] tracking-wide my-1 leading-tight">
              {data.weddingDateFormatted}
            </p>

            {/* Day & Auspicious Time */}
            <p className="font-serif text-xs sm:text-[13px] text-[#8F1736]/90 font-medium leading-tight">
              {data.weddingDayFormatted} • {data.weddingTimeFormatted}
            </p>

            {/* Subtle Ornamental Divider */}
            <div className="flex items-center justify-center gap-2 mt-1.5 w-24 opacity-70">
              <div className="h-[1px] flex-1 bg-[#D9A6B2]"></div>
              <Heart className="w-2 h-2 text-[#8F1736] fill-[#8F1736]" />
              <div className="h-[1px] flex-1 bg-[#D9A6B2]"></div>
            </div>
          </div>

          {/* Scratch Layer */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full z-10 cursor-crosshair transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onMouseMove={scratch}
            onTouchStart={startDrawing}
            onTouchEnd={endDrawing}
            onTouchMove={scratch}
            style={{ touchAction: 'none' }} // Prevent scrolling while scratching on mobile
          />
        </div>

        {/* Ceremony Venue Card - Placed below the scratch heart separately as requested */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-sm mb-6 p-4 sm:p-5 rounded-2xl bg-white/95 border border-pink-border/80 shadow-xs backdrop-blur-xs flex flex-col items-center text-center"
        >
          <span className="text-[10px] font-serif uppercase tracking-widest text-[#A92543] font-bold mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-pink-accent" /> Ceremony Venue
          </span>
          <h4 className="text-sm sm:text-base font-serif font-bold text-[#8F1736] leading-snug">
            {venueName}
          </h4>
          {venueAddress && (
            <p className="text-xs sm:text-[13px] font-serif text-wine-dark/80 mt-1 leading-relaxed">
              {venueAddress}
            </p>
          )}
          {data.venue?.mapUrl && (
            <a
              href={data.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#A92543]/10 text-[#A92543] hover:bg-[#A92543]/20 font-serif text-[11px] font-semibold transition-colors shadow-2xs"
            >
              <MapPin className="w-3 h-3" />
              <span>Get Venue Directions on Google Maps</span>
            </a>
          )}
        </motion.div>

        <motion.div 
          animate={{ opacity: isRevealed ? 1 : 0.5 }}
          className="flex flex-col items-center"
        >
          <button
            onClick={() => isRevealed && generateIcsFile(data)}
            disabled={!isRevealed}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-serif uppercase tracking-widest text-xs transition-all cursor-pointer
              ${isRevealed 
                ? 'bg-[#A92543] text-white shadow-md hover:bg-[#8F1736] active:scale-95' 
                : 'bg-[#D9A6B2]/40 text-[#A92543]/50 cursor-not-allowed'}`}
          >
            <Calendar className="w-4 h-4" />
            Save The Date
          </button>
          <p className="text-[10px] uppercase tracking-widest text-[#A92543] opacity-60 mt-4">
            Add this event to your calendar
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
}
