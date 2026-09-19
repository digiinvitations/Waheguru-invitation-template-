import { Heart, Instagram, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { WeddingData } from "../types";

interface FooterProps {
  data: WeddingData;
}

export function Footer({ data }: FooterProps) {
  return (
    <footer className="py-12 bg-blush-light border-t border-pink-border flex flex-col items-center text-center px-4 relative">
      <div className="mb-4 flex flex-col items-center">
        <span className="font-serif text-[11px] uppercase tracking-[0.25em] text-wine-dark/70 font-semibold mb-1">
          Love &amp; Regards
        </span>
        <h4 className="font-serif text-2xl font-bold text-wine-dark tracking-wide">
          {data.familyRegards || "Gandhi Family"}
        </h4>
      </div>

      <h5 className="font-script text-2xl text-wine-dark mb-3">
        {data.bride.name} &amp; {data.groom.name}
      </h5>
      
      <div className="flex items-center gap-2 opacity-60 mb-8">
        <div className="w-8 h-[1px] bg-wine-dark"></div>
        <Heart className="w-3 h-3 text-wine-dark fill-wine-dark" />
        <div className="w-8 h-[1px] bg-wine-dark"></div>
      </div>
      
      <div className="flex flex-col items-center gap-3 mt-4 text-wine-dark/80 font-serif">
        <p className="text-xs font-bold tracking-wider uppercase flex items-center gap-2">
          Created with <Heart className="w-3 h-3 text-pink-accent fill-pink-accent" /> by digiinvitations_
          <a 
            href="https://www.instagram.com/digiinvitations_?igsi=MWh1ZnZhMm1xNnNkdw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-pink-accent transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
        </p>
        <p className="text-[10px] tracking-widest font-semibold opacity-70">
          To Create Yours Contact: - 9456411569
        </p>
      </div>

      <Link 
        to="/admin" 
        className="absolute bottom-4 right-4 opacity-10 hover:opacity-100 transition-opacity p-2 text-wine-dark"
        title="Admin Panel"
      >
        <Settings className="w-4 h-4" />
      </Link>
    </footer>
  );
}
