import { HeartDivider } from "./HeartDivider";
import { FadeInSection } from "./FadeInSection";
import { VenueDetails } from "../types";
import { MapPin } from "lucide-react";

interface VenueProps {
  venue: VenueDetails;
}

export function Venue({ venue }: VenueProps) {
  return (
    <section className="py-16 px-6 bg-blush-light flex flex-col items-center overflow-hidden">
      <FadeInSection className="w-full max-w-md flex flex-col items-center text-center relative">
        <MapPin className="w-6 h-6 text-wine-dark mb-4 opacity-80" strokeWidth={1.5} />
        <h2 className="font-script text-4xl text-wine-dark">
          Venue
        </h2>
        
        <HeartDivider />

        <FadeInSection delay={100} className="mt-4 flex flex-col items-center relative z-10">
          <span className="text-2xl text-wine-dark font-serif font-bold mb-1 select-none">ੴ</span>
          <h3 className="font-serif font-bold text-xl text-text-body mb-2">{venue.name}</h3>
          <p className="text-text-body text-sm opacity-85 max-w-[280px]">
            {venue.addressLine1}
            <br />
            {venue.addressLine2}
          </p>
        </FadeInSection>

        {/* Gurudwara Sahib Silhouette / Line Art */}
        <FadeInSection delay={150} className="w-full max-w-[280px] h-28 mt-8 mb-6 opacity-30 flex items-end justify-center pointer-events-none">
          <svg viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-wine-dark" strokeWidth="1.2">
            {/* Central Dome */}
            <path d="M100 8 C92 20 82 28 82 46 V85 H118 V46 C118 28 108 20 100 8 Z" />
            <path d="M100 8 V2" />
            {/* Nishan Sahib pole & flag */}
            <line x1="100" y1="2" x2="100" y2="-6" strokeWidth="1.5" />
            <polygon points="100,-6 108,-1 100,4" fill="currentColor" strokeWidth="0" />
            <circle cx="100" cy="8" r="2.5" />
            {/* Kalasa finials */}
            <circle cx="100" cy="2" r="1.5" />
            
            {/* Left Pavilion Dome */}
            <path d="M50 35 C44 43 38 48 38 58 V85 H62 V58 C62 48 56 43 50 35 Z" />
            <line x1="50" y1="35" x2="50" y2="30" />
            <circle cx="50" cy="30" r="1.2" />

            {/* Right Pavilion Dome */}
            <path d="M150 35 C144 43 138 48 138 58 V85 H162 V58 C162 48 156 43 150 35 Z" />
            <line x1="150" y1="35" x2="150" y2="30" />
            <circle cx="150" cy="30" r="1.2" />

            {/* Central Arch Door */}
            <path d="M92 85 V62 C92 57 96 53 100 53 C104 53 108 57 108 62 V85" />

            {/* Base platform */}
            <line x1="15" y1="85" x2="185" y2="85" strokeWidth="1.5" />
            <line x1="5" y1="89" x2="195" y2="89" strokeWidth="1" />
          </svg>
        </FadeInSection>

        {/* Gurudwara Sahib Etiquette Guidelines */}
        <FadeInSection delay={200} className="w-full max-w-sm my-6 p-5 rounded-2xl bg-white/70 border border-pink-border/80 shadow-xs text-left">
          <h4 className="font-serif font-bold text-xs uppercase tracking-[0.15em] text-wine-dark text-center mb-3.5 flex items-center justify-center gap-2">
            <span>ੴ</span> Gurudwara Sahib Etiquette <span>ੴ</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-text-body font-serif leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">🧣</span>
              <span><strong>Head Covering:</strong> Head covering (Rumal / Dupatta / Scarf) is required on Gurudwara premises. Head coverings are graciously provided at the entrance.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">👞</span>
              <span><strong>Footwear:</strong> Please remove shoes and socks at the Joda Ghar (shoe stand) and wash hands before entering the Darbar Sahib.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">🧘</span>
              <span><strong>Seating:</strong> Traditional seating is cross-legged on carpeted floor in the presence of Sri Guru Granth Sahib Ji.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">🌸</span>
              <span><strong>Sanctity:</strong> Tobacco, alcohol, and non-vegetarian items are strictly prohibited on the sacred premises.</span>
            </li>
          </ul>
        </FadeInSection>

        <FadeInSection delay={250} className="w-full flex justify-center">
          <a 
            href={venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-burgundy text-white px-8 py-3 rounded-full font-serif text-xs uppercase tracking-widest shadow-md hover:bg-wine-dark transition-colors active:scale-95 mt-2 inline-block"
          >
            View on Google Maps
          </a>
        </FadeInSection>

      </FadeInSection>
    </section>
  );
}
