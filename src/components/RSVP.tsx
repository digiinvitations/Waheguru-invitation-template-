import React, { useState } from "react";
import { motion } from "motion/react";
import { HeartDivider } from "./HeartDivider";
import { Mail, PhoneCall, MessageSquare, MapPin, ExternalLink, Heart } from "lucide-react";
import { submitRSVP, getRSVPs } from "../services/db";
import { WeddingData } from "../types";

interface RSVPProps {
  data?: WeddingData;
}

export function RSVP({ data }: RSVPProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const rsvpAddress = data?.rsvpAddress || "Gandhi Cloth House, Jhajharia Market, General Ganj, Kanpur";
  const rsvpPhones = data?.rsvpPhones && data.rsvpPhones.length > 0 
    ? data.rsvpPhones 
    : ["7754845678", "7755045678"];

  const handleViewerAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2580") {
      setIsAuthenticated(true);
      setErrorMsg("");
      setLoadingRsvps(true);
      const data = await getRSVPs();
      setRsvps(data);
      setLoadingRsvps(false);
    } else {
      setErrorMsg("Incorrect password");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(e.currentTarget);
    const rsvpData = {
      name: formData.get("name"),
      email: formData.get("email"),
      attending: formData.get("attending"),
      message: formData.get("message")
    };

    try {
      await submitRSVP(rsvpData);
      setStatus("success");
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setStatus("idle");
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <section className="py-16 px-5 bg-blush-light flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <span className="text-2xl text-[#8F1736] font-serif font-bold select-none mb-1">ੴ</span>
        <h2 className="font-script text-4xl sm:text-5xl text-burgundy text-center drop-shadow-2xs">
          R. S. V. P.
        </h2>
        
        <HeartDivider />

        {/* Traditional RSVP Address & Direct Contact Card */}
        <div className="w-full mt-6 p-6 bg-white/95 rounded-2xl border border-pink-border shadow-xs flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-light border border-pink-border text-[10.5px] uppercase tracking-widest font-serif font-bold text-wine-dark mb-3">
            <Heart className="w-3 h-3 text-pink-accent fill-pink-accent" />
            <span>Cordial Invitation &amp; RSVP</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-wine-dark tracking-wide">
            Gandhi Cloth House
          </h3>
          
          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-serif text-wine-dark/80 mt-1.5 px-2 leading-relaxed">
            <MapPin className="w-4 h-4 text-pink-accent flex-shrink-0" />
            <span>Jhajharia Market, General Ganj, Kanpur</span>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Gandhi Cloth House, Jhajharia Market, General Ganj, Kanpur")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-serif font-semibold text-pink-accent hover:text-burgundy transition-colors underline"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Direct Phone Contact Section */}
          <div className="w-full mt-6 pt-5 border-t border-pink-border/80 flex flex-col items-center">
            <span className="text-[11px] font-serif font-bold text-wine-dark/75 uppercase tracking-wider mb-3">
              Direct Contact Options
            </span>

            <div className="w-full flex flex-col gap-3">
              {rsvpPhones.map((phone, idx) => (
                <div 
                  key={idx}
                  className="w-full p-3.5 rounded-xl bg-blush-light/60 border border-pink-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-base text-wine-dark tracking-wider">
                    <PhoneCall className="w-4 h-4 text-burgundy" />
                    <span>+91 {phone}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    {/* Call Directly */}
                    <a
                      href={`tel:${phone}`}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-burgundy hover:bg-wine-dark text-white font-serif text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call</span>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/91${phone}?text=${encodeURIComponent("Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh! Connecting regarding the wedding invitation of Jasmeet & Jaspreet.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-serif text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Online Wishes & Digital RSVP */}
        <div className="w-full mt-10 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 text-wine-dark/60 mb-2">
            <div className="h-[1px] w-8 bg-pink-border" />
            <Mail className="w-4 h-4 text-wine-dark/70" />
            <span className="text-xs uppercase tracking-widest font-serif font-bold">Or Send Wishes Online</span>
            <div className="h-[1px] w-8 bg-pink-border" />
          </div>

          {status === "success" ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full p-8 text-center bg-white/95 rounded-2xl border border-pink-border shadow-xs mt-4"
            >
              <h3 className="font-script text-3xl text-burgundy mb-2">Thank You</h3>
              <p className="text-wine-dark text-sm opacity-80 font-serif">Your warm blessings and RSVP have been received!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full mt-4 p-5 bg-white/80 rounded-2xl border border-pink-border/80 shadow-2xs flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-xs font-semibold text-wine-dark pl-1">Your Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  required 
                  placeholder="Your full name"
                  className="w-full bg-white border border-pink-border/90 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent transition-colors"
                  disabled={status === "submitting"}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-xs font-semibold text-wine-dark pl-1">Phone or Email *</label>
                <input 
                  type="text" 
                  id="email" 
                  name="email"
                  required 
                  placeholder="Your contact number or email"
                  className="w-full bg-white border border-pink-border/90 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent transition-colors"
                  disabled={status === "submitting"}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="attending" className="text-xs font-semibold text-wine-dark pl-1">Will you be attending? *</label>
                <div className="relative">
                  <select 
                    id="attending" 
                    name="attending"
                    required 
                    defaultValue=""
                    className="w-full bg-white border border-pink-border/90 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent transition-colors cursor-pointer text-wine-dark"
                    disabled={status === "submitting"}
                  >
                    <option value="" disabled hidden>Select your response...</option>
                    <option value="yes">Yes, gladly attending with family</option>
                    <option value="no">Regretfully decline, blessings sent</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-pink-accent">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="message" className="text-xs font-semibold text-wine-dark pl-1">Your Wishes &amp; Blessings</label>
                <textarea 
                  id="message" 
                  name="message"
                  rows={2}
                  placeholder="Write your wishes for Jasmeet &amp; Jaspreet..."
                  className="w-full bg-white border border-pink-border/90 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent transition-colors resize-none"
                  disabled={status === "submitting"}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="mt-1 w-full bg-burgundy text-white py-3 rounded-full font-serif text-xs uppercase tracking-widest font-bold shadow-md hover:bg-wine-dark transition-colors active:scale-95 disabled:opacity-70 flex justify-center items-center cursor-pointer"
              >
                {status === "submitting" ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Submit Online Response"
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* RSVP Viewer Section */}
      <div className="w-full max-w-md mt-12 flex flex-col items-center border-t border-pink-border/50 pt-6">
        <button 
          onClick={() => setIsViewerOpen(!isViewerOpen)}
          className="text-[11px] uppercase tracking-widest font-serif font-bold text-wine-dark/70 hover:text-wine-dark flex items-center gap-2 transition-colors cursor-pointer"
        >
          {isViewerOpen ? "Close RSVP Viewer" : "See RSVP Responses (Family Only)"}
        </button>

        {isViewerOpen && (
          <div className="w-full mt-6 bg-white p-6 rounded-2xl border border-pink-border shadow-xs">
            {!isAuthenticated ? (
              <form onSubmit={handleViewerAccess} className="flex flex-col gap-3">
                <p className="text-xs font-serif text-wine-dark mb-1 text-center">Enter passcode to view guest responses</p>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passcode"
                  className="w-full bg-transparent border border-pink-border/80 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent"
                />
                {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
                <button type="submit" className="w-full bg-burgundy text-white py-2 rounded-md font-serif text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-colors cursor-pointer">
                  Unlock Responses
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-serif font-bold text-wine-dark text-sm">Guest Responses</h3>
                  <span className="text-xs font-semibold bg-blush-light text-wine-dark px-2.5 py-1 rounded-full">
                    Total: {rsvps.length}
                  </span>
                </div>
                
                {loadingRsvps ? (
                  <p className="text-center text-sm text-wine-dark/60 py-4">Loading responses...</p>
                ) : rsvps.length === 0 ? (
                  <p className="text-center text-sm text-wine-dark/60 py-4">No online RSVPs yet.</p>
                ) : (
                  rsvps.map((rsvp, idx) => (
                    <div key={idx} className="bg-blush-light p-3 rounded-lg border border-pink-border/50 text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-wine-dark text-sm">{rsvp.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rsvp.attending === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {rsvp.attending === 'yes' ? 'Attending' : 'Declined'}
                        </span>
                      </div>
                      <p className="text-wine-dark/70 mb-1">{rsvp.email}</p>
                      {rsvp.message && (
                        <p className="text-wine-dark italic border-l-2 border-pink-accent pl-2 mt-1">
                          "{rsvp.message}"
                        </p>
                      )}
                      {rsvp.submittedAt && (
                        <p className="text-[10px] text-wine-dark/40 mt-1.5 text-right">
                          {new Date(rsvp.submittedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
