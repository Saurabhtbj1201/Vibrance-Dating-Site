import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from "framer-motion";
import {
  MapPin, ChevronUp, ChevronDown, Briefcase,
  Heart, Languages, GraduationCap, Star, Cigarette,
  Wine, Dumbbell, Salad, PawPrint, Target, Instagram, Music, Film, BadgeCheck
} from "lucide-react";
import type { Profile } from "@workspace/api-client-react";
import { resolveImageUrl } from "@/lib/image-url";

interface SwipeCardProps {
  profile: Profile;
  isFront: boolean;
  onSwipe: (direction: 'like' | 'pass', profileId: string) => void;
}

function ProfileSheet({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const pill = (text: string, key: number) => (
    <span key={key} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white border border-white/20">
      {text}
    </span>
  );

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="absolute inset-0 z-30 rounded-[2rem] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/96 backdrop-blur-sm" />
      <div className="relative h-full overflow-y-auto hide-scrollbar py-6 px-5">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center z-40"
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>

        {/* Header */}
        <div className="mb-5 pr-12">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2 flex-wrap">
            {profile.name}
            <span className="text-xl font-normal text-white/70">{profile.age}</span>
            {(profile as any).verificationStatus === "verified" && (
              <BadgeCheck className="w-6 h-6 text-blue-400 shrink-0" />
            )}
          </h2>
          {profile.profession && (
            <p className="text-primary font-semibold text-sm mt-0.5 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> {profile.profession}
            </p>
          )}
          {profile.location && (
            <p className="text-white/60 text-sm flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {profile.location}
            </p>
          )}
        </div>

        {/* Extra photos */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {profile.photos.slice(1).map((url, i) => (
              <img key={i} src={url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-white/10" />
            ))}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-white/85 leading-relaxed text-sm mb-5">{profile.bio}</p>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">{profile.interests.map((t, i) => pill(t, i))}</div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-0 mb-5">
          {[
            [GraduationCap, "Education", profile.education],
            [Languages, "Languages", (profile.languages as string[] | undefined)?.join(", ")],
            [Heart, "Looking For", profile.lookingFor],
            [Target, "Interested In", profile.interestedIn],
          ].filter(([, , v]) => !!v).map(([Icon, label, value], i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/8">
              <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-xs text-white/50 block">{label as string}</span>
                <span className="text-sm text-white font-medium capitalize">{value as string}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lifestyle */}
        {(profile.smoking || profile.drinking || profile.workout || profile.diet || profile.pets) && (
          <div className="mb-5">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Lifestyle</h4>
            <div className="grid grid-cols-2 gap-2">
              {profile.smoking && (
                <div className="flex items-center gap-2 bg-white/6 rounded-xl px-3 py-2">
                  <Cigarette className="w-4 h-4 text-white/50" /><span className="text-xs text-white capitalize">{profile.smoking}</span>
                </div>
              )}
              {profile.drinking && (
                <div className="flex items-center gap-2 bg-white/6 rounded-xl px-3 py-2">
                  <Wine className="w-4 h-4 text-white/50" /><span className="text-xs text-white capitalize">{profile.drinking}</span>
                </div>
              )}
              {profile.workout && (
                <div className="flex items-center gap-2 bg-white/6 rounded-xl px-3 py-2">
                  <Dumbbell className="w-4 h-4 text-white/50" /><span className="text-xs text-white capitalize">{profile.workout}</span>
                </div>
              )}
              {profile.diet && (
                <div className="flex items-center gap-2 bg-white/6 rounded-xl px-3 py-2">
                  <Salad className="w-4 h-4 text-white/50" /><span className="text-xs text-white capitalize">{profile.diet}</span>
                </div>
              )}
              {profile.pets && (
                <div className="flex items-center gap-2 bg-white/6 rounded-xl px-3 py-2">
                  <PawPrint className="w-4 h-4 text-white/50" /><span className="text-xs text-white capitalize">{profile.pets === "yes" ? "Has pets" : "No pets"}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fun extras */}
        <div className="space-y-0">
          {profile.zodiacSign && (
            <div className="flex items-center gap-3 py-2 border-b border-white/8">
              <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center"><Star className="w-4 h-4 text-primary" /></div>
              <div><span className="text-xs text-white/50 block">Zodiac</span><span className="text-sm text-white capitalize">{profile.zodiacSign}</span></div>
            </div>
          )}
          {profile.favoriteMusic && (
            <div className="flex items-center gap-3 py-2 border-b border-white/8">
              <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center"><Music className="w-4 h-4 text-primary" /></div>
              <div><span className="text-xs text-white/50 block">Music</span><span className="text-sm text-white">{profile.favoriteMusic}</span></div>
            </div>
          )}
          {profile.favoriteMovies && (
            <div className="flex items-center gap-3 py-2 border-b border-white/8">
              <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center"><Film className="w-4 h-4 text-primary" /></div>
              <div><span className="text-xs text-white/50 block">Movies & Shows</span><span className="text-sm text-white">{profile.favoriteMovies}</span></div>
            </div>
          )}
          {profile.instagramHandle && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center"><Instagram className="w-4 h-4 text-primary" /></div>
              <div><span className="text-xs text-white/50 block">Instagram</span><span className="text-sm text-primary">@{profile.instagramHandle}</span></div>
            </div>
          )}
        </div>

        {(profile.hobbies as string[] | undefined)?.length ? (
          <div className="mt-5">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Hobbies</h4>
            <div className="flex flex-wrap gap-2">{(profile.hobbies as string[]).map((t, i) => pill(t, i))}</div>
          </div>
        ) : null}
        <div className="h-8" />
      </div>
    </motion.div>
  );
}

export function SwipeCard({ profile, isFront, onSwipe }: SwipeCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-20, -100], [0, 1]);

  const handleDragEnd = async (_e: any, info: any) => {
    if (showProfile) return;
    const threshold = 100;
    if (info.offset.x > threshold || info.velocity.x > 500) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe('like', (profile as any).userId ?? profile.id);
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe('pass', (profile as any).userId ?? profile.id);
    } else {
      controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const imageUrl = resolveImageUrl(profile.photos?.[0]);

  return (
    <motion.div
      className="absolute inset-0 w-full h-full origin-bottom rounded-[2rem] overflow-hidden bg-card shadow-2xl border border-white/5"
      style={{ x, rotate, scale: isFront ? 1 : 0.95, y: isFront ? 0 : 20, zIndex: isFront ? 10 : 0 }}
      drag={isFront && !showProfile ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={isFront && !showProfile ? { cursor: "grabbing" } : {}}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
      </div>

      {/* LIKE / PASS indicators */}
      {isFront && !showProfile && (
        <>
          <motion.div className="absolute top-12 left-8 border-4 border-green-400 text-green-400 font-display font-bold text-4xl px-4 py-1 rounded-xl rotate-[-15deg] z-20 shadow-[0_0_30px_rgba(74,222,128,0.5)] bg-black/20 backdrop-blur-sm" style={{ opacity: likeOpacity }}>
            LIKE
          </motion.div>
          <motion.div className="absolute top-12 right-8 border-4 border-destructive text-destructive font-display font-bold text-4xl px-4 py-1 rounded-xl rotate-[15deg] z-20 shadow-[0_0_30px_rgba(248,113,113,0.5)] bg-black/20 backdrop-blur-sm" style={{ opacity: passOpacity }}>
            PASS
          </motion.div>
        </>
      )}

      {/* Bottom info */}
      {!showProfile && (
        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <h2 className="text-4xl font-display font-bold text-white flex items-center gap-2 flex-wrap drop-shadow-lg">
            {profile.name}
            <span className="text-2xl font-normal text-white/80">{profile.age}</span>
            {(profile as any).verificationStatus === "verified" && (
              <BadgeCheck className="w-7 h-7 text-blue-400 shrink-0" />
            )}
          </h2>
          {profile.profession && (
            <p className="text-primary font-semibold text-sm flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5" /> {profile.profession}
            </p>
          )}
          {profile.location && (
            <p className="text-white/75 text-sm flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.location}
            </p>
          )}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.interests.slice(0, 3).map((interest, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white border border-white/20">
                  {interest}
                </span>
              ))}
              {profile.interests.length > 3 && (
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/70 border border-white/10">
                  +{profile.interests.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info toggle button */}
      {isFront && !showProfile && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowProfile(true); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white z-20 hover:bg-white/25 transition-colors pointer-events-auto"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Full profile sheet */}
      <AnimatePresence>
        {showProfile && (
          <ProfileSheet profile={profile} onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
