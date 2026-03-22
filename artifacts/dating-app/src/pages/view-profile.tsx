import { useRoute, Link } from "wouter";
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap, Languages,
  Heart, Target, Cigarette, Wine, Dumbbell, Salad, PawPrint,
  Star, Music, Film, Instagram, ChevronLeft
} from "lucide-react";
import { useGetProfile } from "@workspace/api-client-react";

export default function ViewProfile() {
  const [, params] = useRoute("/profiles/:profileId");
  const profileId = params?.profileId || "";
  const { data: profile, isLoading } = useGetProfile(profileId, { query: { enabled: !!profileId } });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!profile) return <div className="p-8 text-center text-foreground">Profile not found</div>;

  const imageUrl = profile.photos?.[0] || `${import.meta.env.BASE_URL}images/placeholder-avatar.png`;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">{label}</span>
          <span className="text-sm text-foreground font-medium capitalize">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-y-auto hide-scrollbar">
      {/* Hero */}
      <div className="relative w-full h-[55vh] flex-shrink-0">
        <img src={imageUrl} alt={profile.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />

        <Link href="/matches">
          <button className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>

        {/* Name overlay */}
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-4xl font-display font-bold text-white drop-shadow-lg flex items-baseline gap-2">
            {profile.name}
            <span className="text-2xl font-normal text-white/80">{profile.age}</span>
          </h1>
          {profile.profession && (
            <p className="text-primary font-semibold text-sm flex items-center gap-1.5 mt-1 drop-shadow">
              <Briefcase className="w-3.5 h-3.5" /> {profile.profession}
            </p>
          )}
          {profile.location && (
            <p className="text-white/80 text-sm flex items-center gap-1.5 mt-0.5 drop-shadow">
              <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.location}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-24 space-y-5 mt-2">
        {/* Extra photos */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {profile.photos.slice(1).map((url, i) => (
              <img key={i} src={url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-border" />
            ))}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">About me</h3>
            <p className="text-foreground leading-relaxed text-sm">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Core details */}
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Details</h3>
          <InfoRow icon={GraduationCap} label="Education" value={profile.education} />
          <InfoRow icon={Languages} label="Languages" value={(profile.languages as string[] | undefined)?.join(", ")} />
          <InfoRow icon={Heart} label="Looking For" value={profile.lookingFor} />
          <InfoRow icon={Target} label="Interested In" value={profile.interestedIn} />
        </div>

        {/* Lifestyle */}
        {(profile.smoking || profile.drinking || profile.workout || profile.diet || profile.pets) && (
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Lifestyle</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                [Cigarette, "Smoking", profile.smoking],
                [Wine, "Drinking", profile.drinking],
                [Dumbbell, "Workout", profile.workout],
                [Salad, "Diet", profile.diet],
                [PawPrint, "Pets", profile.pets],
              ].filter(([, , v]) => !!v).map(([Icon, label, value], i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5">
                  <Icon className="w-4 h-4 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground block">{label as string}</span>
                    <span className="text-xs text-foreground font-medium capitalize">{value as string}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fun extras */}
        {(profile.zodiacSign || profile.favoriteMusic || profile.favoriteMovies || profile.instagramHandle || (profile.hobbies as string[])?.length) && (
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">More about me</h3>
            {profile.zodiacSign && <InfoRow icon={Star} label="Zodiac" value={profile.zodiacSign.charAt(0).toUpperCase() + profile.zodiacSign.slice(1)} />}
            {profile.favoriteMusic && <InfoRow icon={Music} label="Favorite Music" value={profile.favoriteMusic} />}
            {profile.favoriteMovies && <InfoRow icon={Film} label="Favorite Movies / Shows" value={profile.favoriteMovies} />}
            {profile.instagramHandle && (
              <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Instagram className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Instagram</span>
                  <span className="text-sm text-primary font-semibold">@{profile.instagramHandle}</span>
                </div>
              </div>
            )}
            {(profile.hobbies as string[])?.length > 0 && (
              <div className="pt-2">
                <span className="text-xs text-muted-foreground block mb-2">Hobbies</span>
                <div className="flex flex-wrap gap-2">
                  {(profile.hobbies as string[]).map((h, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">{h}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
