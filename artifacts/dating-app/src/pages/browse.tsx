import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Search, X, ChevronDown, MapPin, Briefcase,
  GraduationCap, Heart, Languages, Star, Cigarette, Wine,
  Dumbbell, Salad, PawPrint, Target, Music, Film, Instagram,
  SlidersHorizontal,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/image-url";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");
const PAGE_SIZE = 20;

interface BrowseProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  photos: string[];
  profession?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  hobbies?: string[];
  languages?: string[];
  education?: string;
  course?: string;
  courseStatus?: string;
  completionYear?: number;
  collegeName?: string;
  zodiacSign?: string;
  smoking?: string;
  drinking?: string;
  workout?: string;
  diet?: string;
  pets?: string;
  lookingFor?: string;
  favoriteMusic?: string;
  favoriteMovies?: string;
  instagramHandle?: string;
}

async function fetchProfiles(page: number, search: string): Promise<BrowseProfile[]> {
  const token = localStorage.getItem("spark_token");
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (search) params.set("search", search);
  const res = await fetch(`${BACKEND_URL}/api/profiles?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load profiles");
  return res.json();
}

// ── Profile Detail Sheet ───────────────────────────────────────────────────────

function Pill({ text }: { text: string }) {
  return (
    <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-white border border-white/15">
      {text}
    </span>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 border border-white/10 text-xs text-white/80">
      <span className="text-primary shrink-0">{icon}</span>
      {text}
    </div>
  );
}

function ProfileModal({ profile, onClose }: { profile: BrowseProfile; onClose: () => void }) {
  const mainPhoto = resolveImageUrl(profile.photos?.[0]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col max-w-md mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <motion.div
        className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl overflow-hidden"
        style={{ maxHeight: "92dvh" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
      >
        {/* Hero photo */}
        <div className="relative h-72 shrink-0">
          <img src={mainPhoto} alt={profile.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </button>

          {/* Name overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-3xl font-display font-bold text-white flex items-baseline gap-2">
              {profile.name}
              <span className="text-xl font-normal text-white/70">{profile.age}</span>
            </h2>
            {profile.profession && (
              <p className="text-primary font-semibold text-sm flex items-center gap-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5" />
                {profile.profession}
              </p>
            )}
            {profile.location && (
              <p className="text-white/60 text-sm flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Extra photos */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar shrink-0">
            {profile.photos.slice(1).map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt=""
                className="w-20 h-28 rounded-xl object-cover shrink-0 border border-white/10"
              />
            ))}
          </div>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto hide-scrollbar px-5 pb-10 space-y-5">
          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-sm text-foreground/85 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((t, i) => <Pill key={i} text={t} />)}
              </div>
            </div>
          )}

          {/* Education */}
          {(profile.education || profile.course || profile.collegeName) && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Education</h4>
              <div className="grid grid-cols-2 gap-2">
                {profile.education && <Badge icon={<GraduationCap className="w-3.5 h-3.5" />} text={profile.education} />}
                {profile.course && <Badge icon={<GraduationCap className="w-3.5 h-3.5" />} text={profile.course} />}
                {profile.collegeName && <Badge icon={<GraduationCap className="w-3.5 h-3.5" />} text={profile.collegeName} />}
                {profile.completionYear && (
                  <Badge icon={<GraduationCap className="w-3.5 h-3.5" />}
                    text={`${profile.courseStatus === "pursuing" ? "Pursuing" : "Class of"} ${profile.completionYear}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Lifestyle */}
          {(profile.smoking || profile.drinking || profile.workout || profile.diet || profile.pets || profile.zodiacSign) && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Lifestyle</h4>
              <div className="grid grid-cols-2 gap-2">
                {profile.zodiacSign && <Badge icon={<Star className="w-3.5 h-3.5" />} text={profile.zodiacSign} />}
                {profile.smoking && <Badge icon={<Cigarette className="w-3.5 h-3.5" />} text={profile.smoking} />}
                {profile.drinking && <Badge icon={<Wine className="w-3.5 h-3.5" />} text={profile.drinking} />}
                {profile.workout && <Badge icon={<Dumbbell className="w-3.5 h-3.5" />} text={profile.workout} />}
                {profile.diet && <Badge icon={<Salad className="w-3.5 h-3.5" />} text={profile.diet} />}
                {profile.pets && <Badge icon={<PawPrint className="w-3.5 h-3.5" />} text={`Pets: ${profile.pets}`} />}
              </div>
            </div>
          )}

          {/* Preferences */}
          {(profile.lookingFor || (profile.languages && profile.languages.length > 0)) && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
              <div className="grid grid-cols-2 gap-2">
                {profile.lookingFor && <Badge icon={<Target className="w-3.5 h-3.5" />} text={`Looking for: ${profile.lookingFor}`} />}
                {profile.languages?.map((l, i) => (
                  <Badge key={i} icon={<Languages className="w-3.5 h-3.5" />} text={l} />
                ))}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Hobbies</h4>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((t, i) => <Pill key={i} text={t} />)}
              </div>
            </div>
          )}

          {/* Favourites */}
          {(profile.favoriteMusic || profile.favoriteMovies || profile.instagramHandle) && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Favourites</h4>
              <div className="space-y-2">
                {profile.favoriteMusic && (
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Music className="w-4 h-4 text-primary shrink-0" />
                    <span>{profile.favoriteMusic}</span>
                  </div>
                )}
                {profile.favoriteMovies && (
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Film className="w-4 h-4 text-primary shrink-0" />
                    <span>{profile.favoriteMovies}</span>
                  </div>
                )}
                {profile.instagramHandle && (
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Instagram className="w-4 h-4 text-primary shrink-0" />
                    <span>@{profile.instagramHandle}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Profile Card ───────────────────────────────────────────────────────────────

function ProfileCard({ profile, onClick }: { profile: BrowseProfile; onClick: () => void }) {
  const photo = resolveImageUrl(profile.photos?.[0]);
  return (
    <motion.button
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden aspect-[3/4] w-full group text-left"
      whileTap={{ scale: 0.97 }}
    >
      <img
        src={photo}
        alt={profile.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-bold text-white text-sm leading-tight">
          {profile.name}, {profile.age}
        </p>
        {profile.profession && (
          <p className="text-white/65 text-xs mt-0.5 truncate">{profile.profession}</p>
        )}
      </div>
    </motion.button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Browse() {
  const [profiles, setProfiles] = useState<BrowseProfile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<BrowseProfile | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset when search changes
  useEffect(() => {
    setProfiles([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
  }, [debouncedSearch]);

  const loadPage = useCallback(async (pageNum: number, s: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchProfiles(pageNum, s);
      setProfiles(prev => pageNum === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading]);

  // Load first page when search/reset
  useEffect(() => {
    if (initialLoading) {
      loadPage(1, debouncedSearch);
    }
  }, [initialLoading, debouncedSearch]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    observerRef.current?.disconnect();
    if (!hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadPage(nextPage, debouncedSearch);
        }
      },
      { rootMargin: "200px" }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, page, debouncedSearch]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Search bar */}
      <div className="px-4 pt-3 pb-3 sticky top-0 bg-background z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4">
        {initialLoading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-20 px-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No people found</h3>
            <p className="text-muted-foreground text-sm">Try a different name or clear the search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {profiles.map(p => (
                <ProfileCard key={p.id} profile={p} onClick={() => setSelected(p)} />
              ))}
            </div>

            {/* Lazy load sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {loading && !initialLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {!hasMore && profiles.length > 0 && (
              <p className="text-center text-muted-foreground text-xs py-4">
                You've seen everyone!
              </p>
            )}
          </>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selected && (
          <ProfileModal profile={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
