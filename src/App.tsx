import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Hero } from './components/Hero';
import { InvitationMessage } from './components/InvitationMessage';
import { MusicControl } from './components/MusicControl';
import { ScratchCardSection } from './components/ScratchCard';
import { Countdown } from './components/Countdown';
import { Events } from './components/Events';
import { Timeline } from './components/Timeline';
import { Venue } from './components/Venue';
import { RSVP } from './components/RSVP';
import { ClosingMessage } from './components/ClosingMessage';
import { Footer } from './components/Footer';
import { getWeddingData } from './services/db';
import { WeddingData } from './types';
import { AdminPanel } from './components/AdminPanel';
import { Preloader } from './components/Preloader';
import { OpeningExperience } from './components/OpeningExperience';

function PublicView() {
  const [data, setData] = useState<WeddingData | null>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const [viewState, setViewState] = useState<'opening' | 'main'>('opening');
  const [isScratched, setIsScratched] = useState(false);
  const [isHeroEnded, setIsHeroEnded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData();
      
      // Clean up broken pixabay links that might be cached in Firestore
      if (dbData.heroVideoUrl?.includes("pixabay.com")) dbData.heroVideoUrl = "";
      if (dbData.musicUrl?.includes("pixabay.com")) dbData.musicUrl = "";
      
      setData(dbData);
      if (!dbData.openingThumbnailUrl && !dbData.openingVideoUrl) {
        setViewState('main');
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (data?.ogImageUrl) {
      // Find or create og:image meta tag
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.setAttribute('content', data.ogImageUrl);
      
      // Some platforms also use twitter:image
      let twImageMeta = document.querySelector('meta[name="twitter:image"]');
      if (!twImageMeta) {
        twImageMeta = document.createElement('meta');
        twImageMeta.setAttribute('name', 'twitter:image');
        document.head.appendChild(twImageMeta);
      }
      twImageMeta.setAttribute('content', data.ogImageUrl);
    }
  }, [data]);

  if (!data) {
    return <div className="min-h-screen bg-blush-main flex items-center justify-center font-serif text-wine-dark">Loading...</div>;
  }

  if (isPreloading) {
    return <Preloader data={data} onComplete={() => setIsPreloading(false)} />;
  }

  return (
    <div className={`w-full bg-blush-main relative mx-auto max-w-md shadow-2xl overflow-hidden sm:my-0 ${viewState !== 'main' ? 'h-[100svh]' : 'min-h-[100svh]'}`}>
      
      {/* Website Background Music starts when viewState transitions to 'main' */}
      <MusicControl musicUrl={data.musicUrl} shouldPlay={viewState === 'main'} />

      {/* Main Content */}
      <main className="w-full min-h-[100svh] bg-blush-main relative overflow-hidden">
        <Hero data={data} shouldPlayVideo={viewState === 'main'} onVideoEnd={() => setIsHeroEnded(true)} />
        <InvitationMessage message={data.invitationMessage} isHeroEnded={isHeroEnded} invitedBy={data.invitedBy} />
        <ScratchCardSection data={data} onReveal={() => setIsScratched(true)} />
        {isScratched && <Countdown targetDate={data.weddingDate} />}
        <Events events={data.events} />
        <Timeline events={data.events} />
        <Venue venue={data.venue} />
        <RSVP data={data} />
        <ClosingMessage data={data} />
        <Footer data={data} />
      </main>

      {/* Opening Flow: Thumbnail -> Video -> Sacred Quote Interlude */}
      {viewState !== 'main' && (
        <OpeningExperience 
          data={data} 
          onComplete={() => setViewState('main')} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}


