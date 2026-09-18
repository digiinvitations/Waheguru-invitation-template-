import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  getWeddingData, 
  saveWeddingData, 
  getEnvironmentDocId, 
  isOfficialInstance,
  setCustomSlotId 
} from "../services/db";
import { WeddingData } from "../types";
import { 
  Save, 
  Image as ImageIcon, 
  ArrowLeft, 
  Download, 
  Upload, 
  FileJson, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Music, 
  Video, 
  Database,
  RefreshCw
} from "lucide-react";

export function AdminPanel() {
  const [data, setData] = useState<WeddingData | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [currentSlot, setCurrentSlot] = useState<string>("");
  const [isOfficial, setIsOfficial] = useState<boolean>(true);
  const [customSlotInput, setCustomSlotInput] = useState<string>("");
  const [showSlotSettings, setShowSlotSettings] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const dbData = await getWeddingData();
      setData(dbData);
      setCurrentSlot(getEnvironmentDocId());
      setIsOfficial(isOfficialInstance());
    }
    loadData();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blush-main flex items-center justify-center p-4 font-serif">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-pink-border max-w-sm w-full text-center">
          <h2 className="text-2xl font-script text-wine-dark mb-4">Admin Login</h2>
          <input 
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (password === "4260") setIsAuthenticated(true);
                else alert("Incorrect password");
              }
            }}
            className="w-full border border-pink-border rounded-md px-4 py-2 mb-4 text-center focus:outline-none focus:border-pink-accent"
          />
          <button 
            onClick={() => {
              if (password === "4260") setIsAuthenticated(true);
              else alert("Incorrect password");
            }}
            className="w-full bg-burgundy text-white py-2 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-wine-dark transition-colors"
          >
            Enter
          </button>
          <Link to="/" className="block mt-4 text-sm text-wine-dark/70 hover:text-wine-dark underline">
            Return to Website
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 font-serif">Loading Admin Panel...</div>;

  const handleChange = (path: string, value: any) => {
    setData((prev: any) => {
      const updated = { ...prev };
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setData((prev: any) => {
        const newGallery = [...prev.gallery];
        newGallery[index] = base64String;
        return { ...prev, gallery: newGallery };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      handleChange(field, base64String);
    };
    reader.readAsDataURL(file);
  };

  const addImage = () => {
    setData((prev: any) => ({
      ...prev,
      gallery: [...prev.gallery, ""]
    }));
  };

  const removeImage = (index: number) => {
    setData((prev: any) => {
      const newGallery = [...prev.gallery];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await saveWeddingData(data);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // EXPORT: Download complete JSON package containing all wedding data & files
  const handleExport = () => {
    if (!data) return;
    try {
      const exportPayload = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        databaseSlot: getEnvironmentDocId(),
        couple: `${data.groom?.name || "Groom"} & ${data.bride?.name || "Bride"}`,
        data: data
      };
      const jsonString = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeCouple = `${data.groom?.name || "wedding"}_and_${data.bride?.name || "invitation"}`
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, "_");
      link.href = url;
      link.download = `wedding_backup_${safeCouple}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  // IMPORT: Import complete JSON package from another website or remix
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Support both wrapped export format { data: WeddingData } and raw WeddingData
        const importedData: WeddingData = parsed.data && typeof parsed.data === "object" ? parsed.data : parsed;

        if (!importedData || typeof importedData !== "object") {
          throw new Error("Invalid file format. Please provide a valid JSON backup.");
        }
        if (!importedData.groom || !importedData.bride) {
          throw new Error("Missing groom or bride information in the backup file.");
        }

        // Safety defaults for nested structures
        if (!Array.isArray(importedData.events)) importedData.events = [];
        if (!Array.isArray(importedData.timeline)) importedData.timeline = [];
        if (!Array.isArray(importedData.gallery)) importedData.gallery = [];
        if (!importedData.venue) {
          importedData.venue = { name: "", addressLine1: "", addressLine2: "", mapUrl: "" };
        }

        // Update local state immediately so fields update
        setData(importedData);

        const shouldAutoSave = window.confirm(
          `Backup loaded successfully for ${importedData.groom?.name || "Groom"} & ${importedData.bride?.name || "Bride"}!\n\n` +
          `Events: ${importedData.events.length}\n` +
          `Do you want to SAVE this imported data to this website's database now?`
        );

        if (shouldAutoSave) {
          setSaving(true);
          await saveWeddingData(importedData);
          setSaving(false);
          alert("All data and files have been successfully imported and saved to the database!");
        } else {
          alert("Backup data loaded into the Admin Panel! You can make further edits and click 'Save Changes' whenever you are ready.");
        }
      } catch (err: any) {
        console.error("Import error:", err);
        alert("Failed to import file: " + (err.message || "Invalid JSON structure"));
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  // DOWNLOAD ASSET HELPER: Allows downloading individual media files (videos, mp3, images)
  const handleDownloadAsset = async (url: string, filename: string) => {
    if (!url) return;
    try {
      if (url.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // Fetch blob to prompt download
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback if CORS prevents blob download
      window.open(url, "_blank");
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // List of all media files currently configured in this wedding
  const mediaFilesList = [
    { label: "Opening Thumbnail", url: data.openingThumbnailUrl, type: "image", filename: "opening_thumbnail.png" },
    { label: "Hero Waheguru Logo / Icon", url: data.heroLogoUrl, type: "image", filename: "hero_waheguru_logo.png" },
    { label: "Opening Video", url: data.openingVideoUrl, type: "video", filename: "opening_video.mp4" },
    { label: "Opening Quote Page Background", url: data.openingQuoteBgUrl, type: "image", filename: "opening_quote_bg.jpg" },
    { label: "Hero Section Video", url: data.heroVideoUrl, type: "video", filename: "hero_video.mp4" },
    { label: "Opening Background Music", url: data.openingMusicUrl, type: "audio", filename: "opening_music.mp3" },
    { label: "Background Music", url: data.musicUrl, type: "audio", filename: "background_music.mp3" },
    { label: "OG Social Image", url: data.ogImageUrl, type: "image", filename: "social_og_image.jpg" },
    ...(data.events || []).map((ev, i) => ({
      label: `Event ${i + 1} Video (${ev.title || "Untitled"})`,
      url: ev.videoUrl,
      type: "video",
      filename: `event_${i + 1}_video.mp4`
    })),
    ...(data.gallery || []).map((img, i) => ({
      label: `Gallery Image ${i + 1}`,
      url: img,
      type: "image",
      filename: `gallery_${i + 1}.jpg`
    }))
  ].filter(item => Boolean(item.url));

  const handleDownloadAllLinksTxt = () => {
    if (!data) return;
    const lines: string[] = [
      `================================================`,
      `WEDDING ASSET & MEDIA URL BACKUP`,
      `Couple: ${data.groom?.name} & ${data.bride?.name}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Database Slot: ${currentSlot}`,
      `================================================`,
      ``,
      `[OPENING THUMBNAIL]`,
      data.openingThumbnailUrl || "(None)",
      ``,
      `[HERO RELIGIOUS LOGO / WAHEGURU ICON]`,
      data.heroLogoUrl || "(None)",
      ``,
      `[OPENING VIDEO]`,
      data.openingVideoUrl || "(None)",
      ``,
      `[HERO BACKGROUND VIDEO]`,
      data.heroVideoUrl || "(None)",
      ``,
      `[BACKGROUND MUSIC TRACK]`,
      data.musicUrl || "(None)",
      ``,
      `[OG SOCIAL SHARE IMAGE]`,
      data.ogImageUrl || "(None)",
      ``,
      `[EVENTS]`,
      ...(data.events || []).map((ev, i) => 
        `Event ${i + 1}: ${ev.title} (${ev.date || 'No date'})\n  Video: ${ev.videoUrl || 'None'}\n  Map: ${ev.mapUrl || 'None'}`
      ),
      ``,
      `[GALLERY IMAGES]`,
      ...(data.gallery || []).map((img, i) => `Photo ${i + 1}: ${img.startsWith('data:') ? '[Base64 Uploaded Image]' : img}`)
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding_media_links_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateCustomSlot = () => {
    if (!customSlotInput.trim()) {
      setCustomSlotId("");
      alert("Reset to automatic slot identification.");
    } else {
      setCustomSlotId(customSlotInput.trim());
      alert(`Database slot updated to: ${customSlotInput.trim()}`);
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-blush-main p-4 md:p-8 font-serif text-text-body">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-10 border border-pink-border">
        
        {/* Top Header with Navigation & Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-pink-border pb-6 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-wine-dark hover:text-burgundy bg-blush-light px-3 py-1.5 rounded-full border border-pink-border/50 transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
            <div>
              <h1 className="text-3xl font-script text-wine-dark">Admin Panel</h1>
              <p className="text-xs text-text-body/70 font-sans mt-0.5">Manage wedding details, media files, and backups</p>
            </div>
          </div>

          {/* Action Bar: Export, Import, Save */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Hidden JSON file input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />

            <button 
              onClick={handleExport}
              type="button"
              className="flex items-center gap-1.5 bg-white text-wine-dark border border-pink-border px-3.5 py-2 rounded-md hover:bg-blush-light transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
              title="Download full wedding data & media as a JSON file"
            >
              <Download className="w-4 h-4 text-wine-dark" />
              Export
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="flex items-center gap-1.5 bg-white text-wine-dark border border-pink-border px-3.5 py-2 rounded-md hover:bg-blush-light transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
              title="Upload and load a wedding JSON backup file"
            >
              <Upload className="w-4 h-4 text-wine-dark" />
              Import
            </button>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-burgundy text-white px-5 py-2 rounded-md hover:bg-wine-dark transition-colors disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-sm ml-auto md:ml-0"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-8">

          {/* REMIX ISOLATION & DATABASE STATUS BANNER */}
          <div className="bg-gradient-to-r from-pink-50 to-blush-light rounded-xl p-5 border border-pink-border/70 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg border border-pink-border/60 text-wine-dark shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-wine-dark" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-wine-dark text-sm">Database Isolation & Remix Protection</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isOfficial 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}>
                      {isOfficial ? "Official Master Site" : "Isolated Remix Instance"}
                    </span>
                  </div>
                  <p className="text-xs text-text-body/80 mt-1 font-sans">
                    Active Storage Slot: <code className="bg-white/80 px-1.5 py-0.5 rounded border border-pink-border/50 text-wine-dark font-mono text-[11px]">{currentSlot}</code>
                  </p>
                  <p className="text-xs text-text-body/70 mt-0.5 font-sans">
                    {isOfficial 
                      ? "This is your primary master website. When you create a remix, the remix will automatically receive its own independent slot."
                      : "Remix isolation is active. All edits and files saved in this remix will NEVER touch or overwrite the official website."}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowSlotSettings(!showSlotSettings)}
                className="text-xs text-wine-dark underline hover:text-burgundy font-sans self-end sm:self-center"
              >
                {showSlotSettings ? "Hide Slot Settings" : "Slot Settings"}
              </button>
            </div>

            {showSlotSettings && (
              <div className="mt-4 pt-4 border-t border-pink-border/40 font-sans text-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <span className="text-text-body/80 font-medium">Custom Database Slot ID:</span>
                <input 
                  type="text"
                  placeholder="e.g. wedding_client_2027"
                  value={customSlotInput}
                  onChange={(e) => setCustomSlotInput(e.target.value)}
                  className="bg-white border border-pink-border rounded px-2.5 py-1.5 text-xs flex-1 max-w-xs focus:outline-none focus:border-pink-accent"
                />
                <button
                  type="button"
                  onClick={handleUpdateCustomSlot}
                  className="bg-wine-dark text-white px-3 py-1.5 rounded text-xs hover:bg-burgundy transition-colors"
                >
                  Apply Slot
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomSlotId(""); window.location.reload(); }}
                  className="bg-white border border-pink-border text-wine-dark px-3 py-1.5 rounded text-xs hover:bg-blush-light transition-colors"
                >
                  Reset to Auto
                </button>
              </div>
            )}
          </div>

          {/* BACKUP, IMPORT & EXPORT CENTER */}
          <section className="bg-white rounded-xl p-5 border border-pink-border/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <FileJson className="w-5 h-5 text-wine-dark" />
              <h2 className="text-lg font-bold text-wine-dark">Data Backup & Migration (Import / Export)</h2>
            </div>
            <p className="text-xs text-text-body/75 font-sans mb-4">
              Download all details, messages, timeline events, and file URLs as a portable backup file. 
              You can import this backup file into any remix or another wedding website with 1-click.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 bg-blush-light hover:bg-pink-100/70 border border-pink-border rounded-lg text-wine-dark font-sans font-semibold text-xs transition-colors"
              >
                <Download className="w-4 h-4 text-wine-dark" />
                <span>Download Full Wedding Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 bg-blush-light hover:bg-pink-100/70 border border-pink-border rounded-lg text-wine-dark font-sans font-semibold text-xs transition-colors"
              >
                <Upload className="w-4 h-4 text-wine-dark" />
                <span>Import Wedding Backup File (.json)</span>
              </button>
            </div>

            {/* Uploaded Files & Media List */}
            <div className="mt-4 pt-4 border-t border-pink-border/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-wine-dark">Uploaded Media & Files ({mediaFilesList.length})</h3>
                  <p className="text-[11px] text-text-body/70 font-sans">
                    All media files and videos uploaded to this wedding website. Click to download or copy direct links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadAllLinksTxt}
                  className="flex items-center gap-1.5 text-xs text-wine-dark hover:text-burgundy bg-blush-light px-2.5 py-1 rounded border border-pink-border font-sans font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Links (.txt)</span>
                </button>
              </div>

              {mediaFilesList.length === 0 ? (
                <p className="text-xs text-text-body/60 italic font-sans py-2">No media files currently uploaded.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {mediaFilesList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-blush-light/50 rounded-lg border border-pink-border/40 text-xs font-sans gap-2">
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        {item.type === "video" ? (
                          <Video className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        ) : item.type === "audio" ? (
                          <Music className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-wine-dark shrink-0" />
                        )}
                        <span className="font-semibold text-wine-dark shrink-0">{item.label}:</span>
                        <span className="truncate text-text-body/70 text-[11px]">{item.url}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.url || "", idx)}
                          className="p-1 text-wine-dark hover:bg-white rounded transition-colors"
                          title="Copy Link"
                        >
                          {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadAsset(item.url || "", item.filename)}
                          className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-blush-light border border-pink-border/60 rounded text-[11px] font-medium text-wine-dark transition-colors"
                          title="Download File"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Couple Details */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Couple Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold">Groom</h3>
                <Input label="Name" value={data.groom.name} onChange={(v) => handleChange("groom.name", v)} />
                <Input label="Parents" value={data.groom.parents} onChange={(v) => handleChange("groom.parents", v)} />
                <Input label="Education" value={data.groom.education} onChange={(v) => handleChange("groom.education", v)} />
                <Input label="Profession" value={data.groom.profession} onChange={(v) => handleChange("groom.profession", v)} />
              </div>
              <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
                <h3 className="font-bold">Bride</h3>
                <Input label="Name" value={data.bride.name} onChange={(v) => handleChange("bride.name", v)} />
                <Input label="Parents" value={data.bride.parents} onChange={(v) => handleChange("bride.parents", v)} />
                <Input label="Education" value={data.bride.education} onChange={(v) => handleChange("bride.education", v)} />
                <Input label="Profession" value={data.bride.profession} onChange={(v) => handleChange("bride.profession", v)} />
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Event Date & Time</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Target Date (Countdown ISO)" value={data.weddingDate} onChange={(v) => handleChange("weddingDate", v)} type="datetime-local" />
                <Input label="Formatted Date" value={data.weddingDateFormatted} onChange={(v) => handleChange("weddingDateFormatted", v)} />
                <Input label="Formatted Time" value={data.weddingTimeFormatted} onChange={(v) => handleChange("weddingTimeFormatted", v)} />
                <Input label="Day of Week" value={data.weddingDayFormatted} onChange={(v) => handleChange("weddingDayFormatted", v)} />
             </div>
          </section>

          {/* Messages */}
          <section>
             <h2 className="text-xl font-bold text-wine-dark mb-4">Messages &amp; Text</h2>
             <div className="space-y-4">
               <Input label="Elder Invitation By (e.g. Grandmother Sdn. Jasmer Kaur)" value={data.invitedBy || ""} onChange={(v) => handleChange("invitedBy", v)} />
               <TextArea label="Hero Message" value={data.heroMessage} onChange={(v) => handleChange("heroMessage", v)} />
               <TextArea label="Invitation Message" value={data.invitationMessage} onChange={(v) => handleChange("invitationMessage", v)} />
               <Input label="Family Regards (e.g. Gandhi Family)" value={data.familyRegards || ""} onChange={(v) => handleChange("familyRegards", v)} />
               <TextArea label="Transportation Details" value={data.transportation} onChange={(v) => handleChange("transportation", v)} />
               <Input label="Dress Code" value={data.dressCode} onChange={(v) => handleChange("dressCode", v)} />
               <TextArea label="Closing Message" value={data.closingMessage} onChange={(v) => handleChange("closingMessage", v)} />
             </div>
          </section>

          {/* RSVP & Contact Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">RSVP &amp; Contact Details</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              <Input 
                label="RSVP Address / Shop Venue" 
                value={data.rsvpAddress || ""} 
                onChange={(v) => handleChange("rsvpAddress", v)} 
              />
              <Input 
                label="RSVP Phone 1 (e.g. 7754845678)" 
                value={data.rsvpPhones?.[0] || ""} 
                onChange={(v) => {
                  const phones = [...(data.rsvpPhones || ["", ""])];
                  phones[0] = v;
                  handleChange("rsvpPhones", phones);
                }} 
              />
              <Input 
                label="RSVP Phone 2 (e.g. 7755045678)" 
                value={data.rsvpPhones?.[1] || ""} 
                onChange={(v) => {
                  const phones = [...(data.rsvpPhones || ["", ""])];
                  phones[1] = v;
                  handleChange("rsvpPhones", phones);
                }} 
              />
            </div>
          </section>

          {/* Events */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Events</h2>
            <div className="space-y-4">
              {data.events.map((event, idx) => (
                <div key={event.id || idx} className="bg-blush-light p-4 rounded-lg border border-pink-border/50 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-wine-dark">Event {idx + 1}</h3>
                    <button onClick={() => {
                      const newEvents = [...data.events];
                      newEvents.splice(idx, 1);
                      handleChange("events", newEvents);
                    }} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Event Title" value={event.title} onChange={(v) => handleChange(`events.${idx}.title`, v)} />
                    <Input label="Date" value={event.date} type="date" onChange={(v) => handleChange(`events.${idx}.date`, v)} />
                    <Input label="Time (e.g., 7:00 PM)" value={event.time} onChange={(v) => handleChange(`events.${idx}.time`, v)} />
                    <Input label="Location Name" value={event.location} onChange={(v) => handleChange(`events.${idx}.location`, v)} />
                    <Input label="Timeline Message" value={event.description || ""} onChange={(v) => handleChange(`events.${idx}.description`, v)} />
                    <Input label="Sacred Quote / Gurmukhi Tuk" value={event.quote || ""} onChange={(v) => handleChange(`events.${idx}.quote`, v)} />
                    <Input label="Video URL (.mp4)" value={event.videoUrl || ""} onChange={(v) => handleChange(`events.${idx}.videoUrl`, v)} />
                    <Input label="Map Link (URL)" value={event.mapUrl || ""} onChange={(v) => handleChange(`events.${idx}.mapUrl`, v)} />
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const newEvent = {
                  id: Date.now().toString(),
                  title: "New Event",
                  date: "",
                  time: "",
                  location: "",
                  videoUrl: "",
                  mapUrl: ""
                };
                handleChange("events", [...data.events, newEvent]);
              }} className="text-wine-dark hover:bg-blush-light px-4 py-2 rounded-md border border-pink-border w-full text-center">
                + Add Event
              </button>
            </div>
          </section>

          {/* Media Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Media Settings</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              
              <div className="flex flex-col gap-2">
                <h3 className="font-bold">Opening Thumbnail (Click to Enter)</h3>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'openingThumbnailUrl')}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                />
                <Input label="Or Thumbnail URL" value={data.openingThumbnailUrl || ""} onChange={(v) => handleChange("openingThumbnailUrl", v)} />
                {data.openingThumbnailUrl && <img src={data.openingThumbnailUrl} className="w-24 h-24 object-cover rounded-md mt-2 border border-pink-border" alt="Thumbnail Preview" />}
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Hero Religious Icon / Waheguru Logo (Background-Removed)</h3>
                  {data.heroLogoUrl && (
                    <button 
                      type="button" 
                      onClick={() => handleChange("heroLogoUrl", "")}
                      className="text-xs text-red-600 hover:underline font-sans"
                    >
                      Clear / Reset to Text ੴ
                    </button>
                  )}
                </div>
                <p className="text-xs opacity-75 font-sans">
                  Upload or link a transparent, background-removed image (.png, .webp, or .svg) to replace the symbol above the couple's names in the Hero section.
                </p>
                
                <input 
                  type="file" 
                  accept="image/png,image/webp,image/svg+xml,image/*"
                  onChange={(e) => handleSingleImageUpload(e, 'heroLogoUrl')}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-burgundy file:text-white hover:file:bg-wine-dark cursor-pointer"
                />
                <Input 
                  label="Or Logo Image URL (.png / .svg with transparent background)" 
                  value={data.heroLogoUrl || ""} 
                  onChange={(v) => handleChange("heroLogoUrl", v)} 
                />

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-wine-dark font-sans">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleChange("heroLogoUrl", "/src/assets/ikonkar-gold.svg")}
                    className="text-xs bg-white border border-pink-border px-2.5 py-1 rounded hover:bg-blush-light text-wine-dark font-sans transition-colors"
                  >
                    ੴ Golden Ik Onkar (SVG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("heroLogoUrl", "/src/assets/khanda-gold.svg")}
                    className="text-xs bg-white border border-pink-border px-2.5 py-1 rounded hover:bg-blush-light text-wine-dark font-sans transition-colors"
                  >
                    ⚔️ Golden Khanda Sahib (SVG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("heroLogoUrl", "")}
                    className="text-xs bg-white border border-pink-border px-2.5 py-1 rounded hover:bg-blush-light text-wine-dark font-sans transition-colors"
                  >
                    Typographic ੴ
                  </button>
                </div>

                {/* Transparency Preview Container */}
                <div className="mt-2 p-3 bg-white rounded-lg border border-pink-border/80 flex items-center justify-center gap-4 shadow-2xs">
                  <div className="text-center">
                    <p className="text-[10px] text-wine-dark/75 uppercase tracking-widest font-sans mb-1.5 font-semibold">
                      Hero Preview (White Shade Background)
                    </p>
                    {data.heroLogoUrl ? (
                      <img 
                        src={data.heroLogoUrl} 
                        className="h-16 w-auto max-w-[150px] object-contain drop-shadow-sm mx-auto" 
                        alt="Hero Logo Preview" 
                      />
                    ) : (
                      <span className="text-4xl text-wine-dark font-serif font-bold drop-shadow-sm">
                        ੴ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Video</h3>
                <p className="text-xs opacity-70">Plays immediately after clicking the thumbnail. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Video URL" value={data.openingVideoUrl || ""} onChange={(v) => handleChange("openingVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Quote Page Background Image</h3>
                <p className="text-xs opacity-70">Optional background image for the sacred quote page that appears after the opening video. Direct image URL.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input label="Quote Page Background Image URL" value={data.openingQuoteBgUrl || ""} onChange={(v) => handleChange("openingQuoteBgUrl", v)} />
                  </div>
                  {data.openingQuoteBgUrl && (
                    <div className="w-16 h-16 rounded border border-pink-border overflow-hidden flex-shrink-0 bg-white shadow-2xs">
                      <img src={data.openingQuoteBgUrl} alt="Quote Background Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">OG Image URL (Social Sharing Preview)</h3>
                <p className="text-xs opacity-70">Image shown when sharing the link on WhatsApp, Facebook, etc. Direct URL.</p>
                <Input label="OG Image URL" value={data.ogImageUrl || ""} onChange={(v) => handleChange("ogImageUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Hero Section Video</h3>
                <p className="text-xs opacity-70">Background video for the first section. Must be a direct URL (e.g., .mp4).</p>
                <Input label="Hero Video URL" value={data.heroVideoUrl || ""} onChange={(v) => handleChange("heroVideoUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Opening Background Music</h3>
                <p className="text-xs opacity-70">Plays during the opening video and quote reveal interlude. Direct link to .mp3 file.</p>
                <Input label="Opening Music URL" value={data.openingMusicUrl || ""} onChange={(v) => handleChange("openingMusicUrl", v)} />
              </div>

              <div className="flex flex-col gap-2 border-t border-pink-border pt-4">
                <h3 className="font-bold">Website Background Music</h3>
                <p className="text-xs opacity-70">Direct link to an audio file (e.g., .mp3) to play across the main website.</p>
                <Input label="Music URL" value={data.musicUrl || ""} onChange={(v) => handleChange("musicUrl", v)} />
              </div>
            </div>
          </section>

          {/* Venue Settings */}
          <section>
            <h2 className="text-xl font-bold text-wine-dark mb-4">Venue Details</h2>
            <div className="space-y-4 bg-blush-light p-4 rounded-lg border border-pink-border/50">
              <Input label="Venue Name" value={data.venue.name} onChange={(v) => handleChange("venue.name", v)} />
              <Input label="Address Line 1" value={data.venue.addressLine1} onChange={(v) => handleChange("venue.addressLine1", v)} />
              <Input label="Address Line 2" value={data.venue.addressLine2} onChange={(v) => handleChange("venue.addressLine2", v)} />
              <Input label="Google Maps URL" value={data.venue.mapUrl} onChange={(v) => handleChange("venue.mapUrl", v)} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</label>
      <textarea 
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-pink-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-accent focus:ring-1 focus:ring-pink-accent resize-y"
      />
    </div>
  );
}
