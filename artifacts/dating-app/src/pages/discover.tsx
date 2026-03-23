import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Loader2, X, Check, RefreshCw, ChevronDown } from "lucide-react";
import { SwipeCard } from "@/components/swipe-card";
import { MatchModal } from "@/components/match-modal";
import { useGetDiscoveryProfiles, useRecordSwipe, type Profile } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";

const BASE_URL = import.meta.env.BASE_URL;
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");

interface College { id: string; name: string; city?: string; state?: string; }

interface Filters {
  showMe: "everyone" | "men" | "women";
  minAge: number;
  maxAge: number;
  college: string;
}

const DEFAULT_FILTERS: Filters = {
  showMe: "everyone",
  minAge: 18,
  maxAge: 50,
  college: "",
};

function FilterPanel({ open, onClose, filters, onApply }: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (f: Filters) => void;
}) {
  const [local, setLocal] = useState<Filters>(filters);
  const [colleges, setColleges] = useState<College[]>([]);
  const { token } = useAuth();

  useEffect(() => { setLocal(filters); }, [filters, open]);

  useEffect(() => {
    if (!open || !token) return;
    fetch(`${BACKEND_URL}/api/colleges`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setColleges)
      .catch(() => {});
  }, [open, token]);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setLocal(prev => ({ ...prev, [k]: v }));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-card rounded-t-3xl p-6 pb-10 shadow-2xl border-t border-white/8"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Discovery Filters</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Show Me */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Show Me</p>
              <div className="flex gap-2">
                {(["everyone", "women", "men"] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => set("showMe", opt)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      local.showMe === opt
                        ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-white/20"
                    }`}
                  >
                    {opt === "everyone" ? "Everyone" : opt === "women" ? "Women" : "Men"}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Age Range</p>
                <span className="text-foreground font-bold text-sm bg-muted px-3 py-1 rounded-full">{local.minAge} – {local.maxAge}</span>
              </div>
              <div className="space-y-4">
                {([["Min", "minAge", 18, local.maxAge - 1], ["Max", "maxAge", local.minAge + 1, 80]] as const).map(([label, key, min, max]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-8">{label}</span>
                    <input
                      type="range" min={min} max={max} value={local[key]}
                      onChange={e => set(key, Number(e.target.value) as any)}
                      className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                    />
                    <span className="text-foreground text-xs w-6 text-right font-medium">{local[key]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* College Filter */}
            <div className="mb-8">
              <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">College / University</p>
              <div className="relative">
                <select
                  value={local.college}
                  onChange={e => set("college", e.target.value)}
                  className="w-full appearance-none bg-muted border border-border text-foreground rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary/50"
                >
                  <option value="">Any college</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.name}>{c.name}{c.city ? ` — ${c.city}` : ""}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => { onApply(local); onClose(); }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
            >
              <Check className="w-5 h-5" />
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Discover() {
  const { data: fetchProfiles, isLoading } = useGetDiscoveryProfiles({ limit: 10 });
  const { mutate: swipe } = useRecordSwipe();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matchData, setMatchData] = useState<{ profile: Profile; matchId: string } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    if (fetchProfiles && profiles.length === 0) {
      setProfiles(fetchProfiles);
    }
  }, [fetchProfiles]);

  const getUserId = (profile: Profile) => (profile as any).userId ?? profile.id;

  const handleSwipe = (direction: "like" | "pass", userId: string) => {
    const swipedProfile = profiles[0];
    setProfiles(prev => prev.slice(1));

    swipe(
      { data: { targetUserId: userId, action: direction } },
      {
        onSuccess: (res) => {
          if (res.matched && res.matchId) {
            setMatchData({ profile: swipedProfile, matchId: res.matchId });
          }
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      {/* Sub-header */}
      <div className="flex justify-between items-center px-5 py-3 z-10">
        <p className="text-sm text-muted-foreground font-medium">People near you</p>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground text-sm font-medium"
        >
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Filters
        </button>
      </div>

      {/* Cards Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center px-4 pb-4">
        {isLoading && profiles.length === 0 ? (
          <div className="flex flex-col items-center text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Finding sparks near you…</p>
          </div>
        ) : profiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center p-8 bg-card rounded-3xl border border-white/8 shadow-xl w-full"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <RefreshCw className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Out of Sparks</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You've seen everyone nearby. Try adjusting your filters or check back later!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 rounded-full bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors text-sm"
            >
              Refresh
            </button>
          </motion.div>
        ) : (
          <div className="relative w-full" style={{ height: "min(520px, calc(100vh - 260px))" }}>
            <AnimatePresence>
              {profiles.slice(0, 3).map((profile, i) => (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  isFront={i === 0}
                  onSwipe={handleSwipe}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {profiles.length > 0 && (
        <div className="flex justify-center items-center gap-6 pb-4 z-10 px-4">
          <button
            onClick={() => handleSwipe("pass", getUserId(profiles[0]))}
            className="w-14 h-14 rounded-full bg-card border border-white/10 flex items-center justify-center text-destructive shadow-lg hover:bg-destructive/10 active:scale-95 transition-all"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleSwipe("like", getUserId(profiles[0]))}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_25px_rgba(244,63,94,0.45)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] active:scale-95 transition-all"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      )}

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

      <MatchModal
        isOpen={!!matchData}
        onClose={() => setMatchData(null)}
        matchProfile={matchData?.profile}
        matchId={matchData?.matchId}
      />
    </div>
  );
}
