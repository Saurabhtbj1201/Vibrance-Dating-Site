import { Link } from "wouter";
import { Loader2, Heart, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { resolveImageUrl } from "@/lib/image-url";

interface LikedProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  photos: string[];
  profession?: string;
  location?: string;
  likedBack: boolean;
  matchId?: string | null;
}

function useLikedProfiles() {
  return useQuery<LikedProfile[]>({
    queryKey: ["liked"],
    queryFn: async () => {
      const token = localStorage.getItem("spark_token");
      const backend = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");
      const res = await fetch(`${backend}/api/liked`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch liked profiles");
      return res.json();
    },
    refetchInterval: 15000,
  });
}

export default function Liked() {
  const { data: profiles, isLoading } = useLikedProfiles();

  const matched = profiles?.filter((p) => p.likedBack) ?? [];
  const pending = profiles?.filter((p) => !p.likedBack) ?? [];

  return (
    <div className="flex flex-col h-full w-full pt-4 pb-6 overflow-y-auto hide-scrollbar">
      {isLoading ? (
        <div className="flex justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <div className="flex flex-col items-center text-center mt-16 px-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Likes Yet</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Go discover some people and swipe right to like them. They'll appear here!
          </p>
          <Link href="/discover">
            <button className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg hover:-translate-y-0.5 transition-transform">
              Start Swiping
            </button>
          </Link>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {matched.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
                  Mutual Matches ({matched.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {matched.map((p) => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  People You Liked ({pending.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {pending.map((p) => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileCard({ profile }: { profile: LikedProfile }) {
  const imageUrl = resolveImageUrl(profile.photos?.[0]);

  const card = (
    <div className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer">
      <img
        src={imageUrl}
        alt={profile.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {profile.likedBack && (
        <div className="absolute top-2.5 right-2.5 bg-primary rounded-full px-2.5 py-1 flex items-center gap-1 shadow-lg">
          <Heart className="w-3 h-3 text-white" fill="white" />
          <span className="text-[10px] font-bold text-white">Match</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-bold text-white text-base leading-tight">
          {profile.name}, {profile.age}
        </p>
        {profile.profession && (
          <p className="text-white/70 text-xs mt-0.5 truncate">{profile.profession}</p>
        )}
        {profile.likedBack && (
          <div className="mt-2 w-full py-1.5 rounded-lg bg-primary/80 backdrop-blur-sm text-white text-xs font-bold text-center">
            Start chatting →
          </div>
        )}
      </div>
    </div>
  );

  if (profile.likedBack && profile.matchId) {
    return <Link href={`/chat/${profile.matchId}`}>{card}</Link>;
  }

  return <div>{card}</div>;
}
