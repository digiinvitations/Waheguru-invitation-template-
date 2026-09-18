import { motion } from "motion/react";
import { Heart } from "lucide-react";

interface InvitationMessageProps {
  message: string;
  isHeroEnded?: boolean;
  invitedBy?: string;
}

export function InvitationMessage({ message, isHeroEnded, invitedBy }: InvitationMessageProps) {
  return (
    <section className="relative px-6 pt-28 pb-24 bg-gradient-to-b from-white via-[#FAF5F6] to-[#F8E8EB] flex flex-col items-center text-center">
      <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white via-white/60 to-transparent pointer-events-none transition-opacity duration-1000 z-0 ${isHeroEnded ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Soft luminous white gradient flows naturally from the Hero section above */}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="max-w-md mx-auto flex flex-col items-center relative z-10"
      >
        <div className="flex items-center justify-center w-full gap-4 mb-4">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#D9A6B2]"></div>
          <span className="text-2xl text-[#8F1736] font-serif font-bold select-none">ੴ</span>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#D9A6B2]"></div>
        </div>

        {/* Respected Elder Invitation Pill */}
        <div className="mb-6 px-4 py-1.5 rounded-full bg-white/70 border border-[#D9A6B2]/50 shadow-2xs backdrop-blur-xs">
          <span className="text-xs font-serif font-bold text-[#8F1736] tracking-wider uppercase">
            Invitation by {invitedBy || "Grandmother Sdn. Jasmer Kaur"}
          </span>
        </div>

        {/* Sacred Anand Karaj Tuk */}
        <div className="mb-8 px-4 py-5 rounded-2xl bg-white/40 border border-[#D9A6B2]/40 backdrop-blur-xs shadow-xs max-w-sm">
          <p className="font-serif font-bold text-base md:text-lg text-[#8F1736] leading-relaxed tracking-wide mb-2">
            ਧਨ ਪਿਰੁ ਏਹਿ ਨ ਆਖੀਅਨਿ ਬਹਿਨਿ ਇਕਠੇ ਹੋਇ ॥<br />
            ਏਕ ਜੋਤਿ ਦੁਇ ਮੂਰਤੀ ਧਨ ਪਿਰੁ ਕਹੀਐ ਸੋਇ ॥
          </p>
          <p className="font-serif text-xs md:text-sm text-[#5D4147] italic leading-relaxed mt-2 opacity-90">
            &ldquo;They are not said to be husband and wife who merely sit together. Rather, they alone are called husband and wife, who have one soul in two bodies.&rdquo;
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8F1736] font-semibold mt-2.5 opacity-80 font-serif">
            — Sri Guru Granth Sahib Ji (Ang 788)
          </p>
        </div>
        
        <p className="font-serif font-semibold text-lg md:text-xl text-[#8F1736] leading-relaxed whitespace-pre-line italic opacity-100 px-4">
          {message}
        </p>
        
        <div className="flex items-center justify-center w-full gap-4 mt-8">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#D9A6B2]"></div>
          <Heart className="w-5 h-5 text-[#D9A6B2] fill-[#D9A6B2] opacity-80" />
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#D9A6B2]"></div>
        </div>
      </motion.div>

    </section>
  );
}
