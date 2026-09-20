import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { HeartDivider } from "./HeartDivider";
import { EventDetails } from "../types";
import { PartyPopper, Calendar, MapPin, Sparkles, Heart, Clock, X } from "lucide-react";

interface EventsProps {
  events: EventDetails[];
}

// Map event titles to ceremonial icons
const getEventEmoji = (title: string, index: number) => {
  const t = title.toLowerCase();
  if (t.includes("kirtan") || t.includes("darbar")) return "ੴ";
  if (t.includes("haldi")) return "🌻";
  if (t.includes("sangeet") || t.includes("music") || t.includes("dance")) return "🎵";
  if (t.includes("wedding") || t.includes("anand") || t.includes("karaj")) return "🕊️";
  if (t.includes("reception")) return "🥂";
  return String(index + 1).padStart(2, "0");
};

// Default quotes specified for each event
const getEventQuote = (event: EventDetails) => {
  if (event.quote && event.quote.trim()) return event.quote.trim();
  const t = (event.title || "").toLowerCase();
  if (t.includes("kirtan")) {
    return "ਤੂ ਸਮਰਥੁ ਅਕਥੁ ਅਗੋਚਰੁ ਜੀਉ ਪਿੰਡੁ ਤੇਰੀ ਰਾਸਿ ॥\nਰਹਮ ਤੇਰੀ ਸੁਖੁ ਪਾਇਆ ਸਦਾ ਨਾਨਕ ਕੀ ਅਰਦਾਸਿ ॥";
  }
  if (t.includes("haldi")) {
    return "ਧਨ ਪਿਰੁ ਏਹਿ ਨ ਆਖੀਅਨਿ ਬਹਨਿ ਇਕਠੇ ਹੋਇ ॥\nਏਕ ਜੋਤਿ ਦੁਇ ਮੂਰਤੀ ਧਨ ਪਿਰੁ ਕਹੀਐ ਸੋਇ ||";
  }
  if (t.includes("sangeet") || t.includes("music") || t.includes("dance")) {
    return "ਹਰਿ ਪ੍ਰਭੁ ਕਾਜੁ ਰਚਾਇਆ ॥\nਗੁਰਮੁਖਿ ਵੀਆਹਣੁ ਆਇਆ ॥";
  }
  if (t.includes("wedding") || t.includes("anand") || t.includes("karaj")) {
    return "ਹਰਿ ਪ੍ਰਭੁ ਕਾਜੁ ਰਚਾਇਆ ॥\nਗੁਰਮੁਖਿ ਵੀਆਹਣੁ ਆਇਆ ॥";
  }
  return "ਹਰਿ ਪ੍ਰਭੁ ਕਾਜੁ ਰਚਾਇਆ ॥\nਗੁਰਮੁਖਿ ਵੀਆਹਣੁ ਆਇਆ ॥";
};

// English spiritual explanations for the Gurbani quotes
const getEventQuoteExplanation = (event: EventDetails) => {
  const quote = getEventQuote(event);
  if (quote.includes("ਏਕ ਜੋਤਿ") || quote.includes("ਧਨ ਪਿਰੁ")) {
    return "“They are not husband and wife who merely sit together. Truly united are they who have one light in two bodies.”";
  }
  if (quote.includes("ਕਾਜੁ ਰਚਾਇਆ") || quote.includes("ਗੁਰਮੁਖਿ")) {
    return "“The Lord God has orchestrated this blessed union; by the Guru’s grace, the sacred wedding day has arrived.”";
  }
  if (quote.includes("ਤੂ ਸਮਰਥੁ") || quote.includes("ਨਾਨਕ ਕੀ ਅਰਦਾਸਿ")) {
    return "“You are all-powerful and boundless; body and soul are Your gifts. By Your grace we find peace; this is forever our prayer.”";
  }
  return "“With the grace and divine blessings of the Almighty, two souls unite as one on this sacred path of love and devotion.”";
};

// Robust chronological date parser
const parseEventDateTime = (dateStr: string, timeStr: string): number => {
  if (!dateStr) return 0;
  
  // Try ISO YYYY-MM-DD
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      let hours = 12;
      let minutes = 0;
      const timeMatch = (timeStr || "").match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const meridian = timeMatch[3]?.toUpperCase();
        if (meridian === "PM" && hours < 12) hours += 12;
        if (meridian === "AM" && hours === 12) hours = 0;
      }
      return new Date(year, month, day, hours, minutes).getTime();
    }
  }

  // Try standard formatted date e.g. "Nov 10, 2026"
  const d = new Date(`${dateStr} 2026 ${timeStr}`);
  if (!isNaN(d.getTime())) return d.getTime();

  const dOnly = new Date(dateStr);
  if (!isNaN(dOnly.getTime())) {
    let hours = 12;
    let minutes = 0;
    const timeMatch = (timeStr || "").match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridian = timeMatch[3]?.toUpperCase();
      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
    }
    dOnly.setHours(hours, minutes, 0, 0);
    return dOnly.getTime();
  }

  return 0;
};

// Display date formatting
const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "";
  if (dateStr.includes("-")) {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      }
    } catch (e) {}
  }
  return dateStr;
};

// Systematic date breakdown (Day of week + formatted date)
const formatSystematicDate = (dateStr: string) => {
  if (!dateStr) return { dayOfWeek: "", dateFormatted: "" };
  try {
    let d: Date | null = null;
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    } else {
      const parsed = new Date(dateStr.includes("2026") ? dateStr : `${dateStr}, 2026`);
      if (!isNaN(parsed.getTime())) {
        d = parsed;
      }
    }
    if (d && !isNaN(d.getTime())) {
      const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "long" });
      const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return { dayOfWeek, dateFormatted };
    }
  } catch (e) {}
  return { dayOfWeek: "", dateFormatted: dateStr };
};

function EventPopup({ event, onClose }: { event: EventDetails; onClose: () => void }) {
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=Wedding+Event&location=${encodeURIComponent(event.location)}`;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Prevent scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Force mute to bypass browser autoplay quirk
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.volume = 0;
    }
  }, [event.videoUrl]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto px-4">
      {/* Light pink transparent overlay */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#F9E8EC]/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Close Button on Background */}
      <button 
        onClick={onClose}
        className="absolute top-5 right-5 z-[100000] p-2 sm:px-4 sm:py-2 bg-white/90 rounded-full flex items-center justify-center gap-1.5 text-burgundy font-serif text-[11px] uppercase tracking-widest font-bold backdrop-blur-md hover:bg-white transition-colors border border-pink-border shadow-sm cursor-pointer"
        aria-label="Close video"
      >
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">Close</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="relative z-10 w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center justify-center"
      >
        {/* Celebration animations left and right */}
        <motion.div 
          initial={{ opacity: 0, x: -100, y: 80, scale: 0, rotate: -45 }} 
          animate={{ opacity: 1, x: -50, y: 20, scale: 1, rotate: -15 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="absolute -left-12 top-16 text-4xl opacity-100 pointer-events-none z-20 drop-shadow-lg"
        >
          🎉
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 100, y: 80, scale: 0, rotate: 45 }} 
          animate={{ opacity: 1, x: 50, y: 20, scale: 1, rotate: 15 }}
          transition={{ duration: 0.8, delay: 0.15, type: "spring", bounce: 0.5 }}
          className="absolute -right-12 top-16 text-4xl opacity-100 pointer-events-none z-20 drop-shadow-lg"
        >
          🥂
        </motion.div>

        {/* 9:16 Video Container */}
        <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-xl bg-blush-light relative border-[3px] border-pink-border/80 mx-auto flex-none">
          {event.videoUrl ? (
            <video 
              ref={videoRef}
              src={event.videoUrl} 
              autoPlay muted loop playsInline preload="auto"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-wine-dark/60 text-xs font-serif p-4 text-center">
              <PartyPopper className="w-8 h-8 mb-2 opacity-50 text-burgundy" />
              <p className="font-bold text-sm mb-1 text-burgundy">{event.title}</p>
              <span>Celebration memories</span>
            </div>
          )}
        </div>

        {/* Buttons below video */}
        <div className="flex w-full gap-3 mt-4">
          <a 
            href={calUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-burgundy text-white py-3 rounded-full font-serif text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-wine-dark transition-colors shadow-lg"
          >
            <Calendar className="w-3.5 h-3.5" /> Save Date
          </a>
          {event.mapUrl && (
            <a 
              href={event.mapUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-burgundy text-white py-3 rounded-full font-serif text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-wine-dark transition-colors shadow-lg backdrop-blur-sm"
            >
              <MapPin className="w-3.5 h-3.5" /> Direction
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TimelineEventNode({ 
  event, 
  index, 
  isLast 
}: { 
  event: EventDetails; 
  index: number; 
  isLast: boolean; 
}) {
  const [isHolding, setIsHolding] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    setIsHolding(true);
    holdTimer.current = setTimeout(() => {
      setIsHolding(false);
      setIsRevealed(true);
      setShowPopup(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#F8E8EB", "#F4C2C2", "#800020"],
        zIndex: 100000
      });
    }, 800);
  };

  const stopHold = () => {
    setIsHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  const emoji = getEventEmoji(event.title, index);
  const quote = getEventQuote(event);
  const quoteExplanation = getEventQuoteExplanation(event);
  const displayDate = formatDisplayDate(event.date);
  const { dayOfWeek, dateFormatted } = formatSystematicDate(event.date);
  const isWeddingCeremony = 
    event.title.toLowerCase().includes("wedding") || 
    event.title.toLowerCase().includes("anand") ||
    event.title.toLowerCase().includes("karaj");

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Central Timeline Milestone Icon Badge */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-12 h-12 rounded-full bg-white border-2 border-pink-accent/80 shadow-md flex items-center justify-center text-burgundy font-serif font-bold text-base ring-4 ring-pink-accent/15"
        >
          {emoji}
        </motion.div>
      </div>

      {/* Ceremony Details Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center mt-3 mb-2 px-2">
        {/* Event Heading - ALWAYS VISIBLE */}
        <h3 className="font-script text-4xl sm:text-5xl text-burgundy mb-2 drop-shadow-2xs">
          {event.title}
        </h3>

        {/* 1. Sacred Gurbani Quote - Placed FIRST as requested */}
        <div className="w-full my-2.5 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl bg-white/90 border border-pink-border/90 shadow-2xs backdrop-blur-xs text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-[1px] w-6 bg-pink-accent/40" />
            <span className="font-serif text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#8F1736] font-bold">
              ੴ Sacred Gurbani Blessing • Ceremony {index + 1} ੴ
            </span>
            <div className="h-[1px] w-6 bg-pink-accent/40" />
          </div>

          {/* Gurmukhi Tuk */}
          <p className="font-serif text-base sm:text-lg md:text-xl text-burgundy leading-relaxed whitespace-pre-line font-bold drop-shadow-2xs">
            {quote}
          </p>

          {/* English Spiritual Explanation - Slightly more large font for effortless readability */}
          {quoteExplanation && (
            <p className="font-serif text-[14.5px] sm:text-[16px] md:text-[16.5px] italic text-wine-dark leading-relaxed font-medium mt-3 pt-3 border-t border-pink-border/50 max-w-sm mx-auto drop-shadow-2xs">
              {quoteExplanation}
            </p>
          )}
        </div>

        {/* 2. Venue, Systematic Date & Time Display - Placed BELOW quote */}
        <div className={`w-full my-2.5 p-4 sm:p-5 rounded-2xl bg-white/95 border shadow-2xs backdrop-blur-xs flex flex-col items-center gap-3 ${
          isWeddingCeremony 
            ? 'border-[#D9A6B2] ring-2 ring-[#D9A6B2]/40 bg-gradient-to-b from-white to-[#FDF4F6]' 
            : 'border-pink-border/90'
        }`}>
          {isWeddingCeremony && (
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#8F1736] text-white shadow-2xs">
              <span className="font-serif text-[11px] font-bold uppercase tracking-widest">
                ੴ Sacred Anand Karaj Ceremony ੴ
              </span>
            </div>
          )}

          {/* Venue Line */}
          <div className="w-full pb-2.5 border-b border-pink-border/50 flex flex-col items-center justify-center gap-1 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-serif uppercase tracking-widest text-[#A92543] font-bold">
              <MapPin className="w-3.5 h-3.5 text-pink-accent flex-shrink-0" />
              <span>Ceremony Venue</span>
            </div>
            <span className="text-sm sm:text-base font-serif font-bold text-burgundy leading-snug">
              {event.location}
            </span>
            {event.mapUrl && (
              <a 
                href={event.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] sm:text-xs font-serif text-pink-accent hover:text-burgundy underline underline-offset-2 font-medium"
              >
                <span>Get Venue Directions</span>
              </a>
            )}
          </div>

          {/* Systematic 2-Column Date & Time Grid */}
          <div className="w-full grid grid-cols-2 gap-3 text-center items-center py-0.5">
            {/* Date Column - Prominently sized & bold */}
            <div className="flex flex-col items-center justify-center border-r border-pink-border/60 pr-2">
              <div className="flex items-center gap-1.5 text-pink-accent mb-1">
                <Calendar className="w-4 h-4 text-pink-accent flex-shrink-0" />
                <span className="text-[11px] sm:text-xs uppercase tracking-widest font-serif font-bold text-wine-dark/75">
                  {dayOfWeek || "Date"}
                </span>
              </div>
              <span className="font-serif text-xl sm:text-2xl md:text-[26px] font-extrabold text-burgundy tracking-wide leading-tight drop-shadow-2xs">
                {dateFormatted || displayDate}
              </span>
            </div>

            {/* Time Column */}
            <div className="flex flex-col items-center justify-center pl-2">
              <div className="flex items-center gap-1.5 text-pink-accent mb-1">
                <Clock className="w-4 h-4 text-pink-accent flex-shrink-0" />
                <span className="text-[11px] sm:text-xs uppercase tracking-widest font-serif font-bold text-wine-dark/75">
                  Auspicious Time
                </span>
              </div>
              <span className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#8F1736] tracking-wide leading-tight">
                {event.time}
              </span>
            </div>
          </div>
        </div>

        {/* Press and Hold Button */}
        <div className="mt-2 flex flex-col items-center w-full">
          <motion.button
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onContextMenu={(e) => e.preventDefault()}
            whileTap={{ scale: 0.95 }}
            className="relative w-full max-w-[260px] py-3.5 px-6 rounded-full border border-pink-accent/50 bg-white text-wine-dark font-serif text-xs uppercase tracking-widest overflow-hidden touch-none select-none shadow-sm flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="absolute left-4 text-pink-accent/60 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
            </div>
            <div className="absolute right-4 text-pink-accent/60 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
            </div>
            <div className="relative z-10 flex items-center gap-1.5 font-bold tracking-[0.12em]">
              {isRevealed ? "Hold to View Video" : "Press & Hold to Reveal"}
            </div>
            {/* Progress background */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-pink-accent/20"
              initial={{ width: 0 }}
              animate={{ width: isHolding ? "100%" : 0 }}
              transition={{ duration: isHolding ? 0.8 : 0.3, ease: "linear" }}
            />
          </motion.button>
          
          <span className="text-[10px] font-serif text-wine-dark/60 tracking-wider uppercase mt-1.5 font-medium">
            {isRevealed ? "Hold to replay celebration & directions" : "Hold to reveal event details & video"}
          </span>
        </div>
      </div>

      {/* Connecting Timeline Line to next event */}
      {!isLast && (
        <div className="flex flex-col items-center my-6">
          <div className="w-0.5 h-10 bg-gradient-to-b from-pink-accent/50 to-pink-border" />
          <div className="w-2 h-2 rounded-full bg-pink-accent/50 my-0.5" />
          <div className="w-0.5 h-10 bg-gradient-to-b from-pink-border to-pink-accent/50" />
        </div>
      )}

      {/* Interactive Celebration Popup */}
      <AnimatePresence>
        {showPopup && <EventPopup event={event} onClose={() => setShowPopup(false)} />}
      </AnimatePresence>
    </div>
  );
}

export function Events({ events }: EventsProps) {
  if (!events || events.length === 0) return null;

  // Chronologically sort events into timeline order
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = parseEventDateTime(a.date, a.time);
    const timeB = parseEventDateTime(b.date, b.time);
    if (timeA && timeB && timeA !== timeB) return timeA - timeB;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  return (
    <section className="py-20 px-4 sm:px-6 bg-blush-light flex flex-col items-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg flex flex-col items-center"
      >
        <PartyPopper className="w-6 h-6 text-pink-accent mb-3 opacity-80" strokeWidth={1.5} />
        <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-widest text-wine-dark text-center drop-shadow-sm font-bold">
          Wedding Ceremonies
        </h2>
        <p className="font-serif text-xs uppercase tracking-[0.2em] text-wine-dark/70 mt-1">
          Sacred Celebrations &amp; Anand Karaj
        </p>
        
        <HeartDivider />

        {/* Timeline Stream */}
        <div className="w-full flex flex-col items-center mt-10">
          {sortedEvents.map((event, index) => (
            <motion.div 
              key={event.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full"
            >
              <TimelineEventNode 
                event={event} 
                index={index} 
                isLast={index === sortedEvents.length - 1} 
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

