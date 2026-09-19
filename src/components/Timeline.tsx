import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { EventDetails } from "../types";
import { Clock, MapPin, CalendarHeart, Calendar } from "lucide-react";

interface TimelineProps {
  events: EventDetails[];
}

// Map some common event words to emojis
const getEmoji = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('sangeet') || t.includes('music') || t.includes('dance')) return '🎵';
  if (t.includes('haldi')) return '🌻';
  if (t.includes('mehndi') || t.includes('henna')) return '🌿';
  if (t.includes('ring') || t.includes('engagement')) return '💍';
  if (t.includes('wedding') || t.includes('marriage') || t.includes('pheras')) return '🕊️';
  if (t.includes('reception') || t.includes('party')) return '🥂';
  return '✨';
};

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) return null;

  // Sort events automatically by date/time
  const sortedEvents = [...events].sort((a, b) => {
    const parseTime = (dateStr: string, timeStr: string) => {
      if (!dateStr) return 0;
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          return d.getTime();
        }
      }
      let d = new Date(`${dateStr} ${timeStr}`);
      if (isNaN(d.getTime())) {
        d = new Date(`${dateStr} 2026 ${timeStr}`);
      }
      if (isNaN(d.getTime())) {
        d = new Date(dateStr);
      }
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    const dateA = parseTime(a.date, a.time);
    const dateB = parseTime(b.date, b.time);
    if (dateA && dateB && dateA !== dateB) return dateA - dateB;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  return (
    <section className="py-16 px-4 md:px-6 bg-blush-main flex flex-col items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl flex flex-col items-center"
      >
        <CalendarHeart className="w-8 h-8 text-wine-dark mb-4 opacity-80" strokeWidth={1.5} />
        <h2 className="font-script text-4xl text-wine-dark text-center drop-shadow-sm">
          Program Timeline
        </h2>
        
        <HeartDivider />

        <div className="w-full mt-10 relative">
          {/* Central Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pink-border/80 transform -translate-x-1/2" />

          {sortedEvents.map((item, index) => {
            const isEven = index % 2 === 0;
            const emoji = getEmoji(item.title);
            
            // For parsing a nicer date if they used YYYY-MM-DD
            let displayDate = item.date;
            try {
              if (item.date.includes('-')) {
                const d = new Date(item.date);
                displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
            } catch(e) {}

            return (
              <motion.div 
                key={item.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                className={`mb-12 relative w-full flex flex-row items-start ${isEven ? 'justify-start' : 'justify-end'}`}
              >
                {/* Center marker */}
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-2 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-blush-light border-2 border-pink-border/80 shadow-sm z-10 text-sm md:text-lg">
                  {emoji}
                </div>
                
                {/* Content Card */}
                <div className={`w-[48%] md:w-[45%] ${isEven ? 'pr-4 md:pr-10 text-right' : 'pl-4 md:pl-10 text-left'} relative z-0`}>
                  <div className="bg-white/70 backdrop-blur-sm p-4 md:p-5 rounded-xl md:rounded-2xl border border-pink-border/50 shadow-sm hover:shadow-md transition-shadow relative">
                    <h3 className="font-script text-2xl md:text-3xl text-burgundy mb-1.5">{item.title}</h3>
                    
                    <div className={`flex flex-col gap-1.5 mb-2 md:mb-3 ${isEven ? 'items-end' : 'items-start'}`}>
                      <div className={`flex flex-wrap gap-x-2.5 gap-y-1 items-center ${isEven ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-burgundy font-bold font-serif text-xs md:text-sm tracking-wide flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-pink-accent" /> {displayDate}
                        </span>
                        <span className="text-wine-dark font-semibold font-serif text-xs md:text-sm tracking-wide flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-pink-accent" /> {item.time}
                        </span>
                      </div>
                      <p className="text-wine-dark/80 font-medium font-serif text-[10px] md:text-xs tracking-wider flex items-center gap-1.5 text-left sm:text-right">
                        <MapPin className="w-3.5 h-3.5 text-pink-accent flex-shrink-0" /> <span className="break-words">{item.location}</span>
                      </p>
                    </div>

                    {item.description && (
                      <div className="w-full h-px bg-pink-border/30 my-2 md:my-3" />
                    )}

                    {item.description && (
                      <p className="text-xs md:text-sm text-wine-dark/90 leading-relaxed font-serif italic">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
