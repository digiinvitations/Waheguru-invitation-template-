export interface Person {
  name: string;
  parents: string;
  education: string;
  profession: string;
}

export interface EventDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  quote?: string;
  icon?: string;
  image?: string;
  videoUrl?: string;
  mapUrl?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
}

export interface VenueDetails {
  name: string;
  addressLine1: string;
  addressLine2: string;
  mapUrl: string;
}

export interface WeddingData {
  groom: Person;
  bride: Person;
  weddingDate: string; // ISO format for countdown
  weddingDateFormatted: string;
  weddingTimeFormatted: string;
  weddingDayFormatted: string;
  openingThumbnailUrl?: string;
  openingVideoUrl?: string;
  openingQuoteBgUrl?: string;
  heroVideoUrl?: string;
  heroLogoUrl?: string; // Background-removed image icon or religious logo for Hero section
  ogImageUrl?: string;
  heroMessage: string;
  invitationMessage: string;
  events: EventDetails[];
  timeline: TimelineItem[];
  venue: VenueDetails;
  transportation: string;
  dressCode: string;
  gallery: string[];
  musicUrl: string;
  openingMusicUrl?: string;
  closingMessage: string;
  invitedBy?: string;
  familyRegards?: string;
  rsvpAddress?: string;
  rsvpPhones?: string[];
}
