import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Search, Sparkles } from "lucide-react";
import { useGetMatches } from "@workspace/api-client-react";

export default function Matches() {
  const [search, setSearch] = useState("");
  const { data: matches, isLoading } = useGetMatches({
    query: { refetchInterval: 10000 },
  });

  const filtered = matches?.filter((m) =>
    m.profile?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Search */}
      <div className="px-4 pt-3 pb-3 sticky top-0 bg-background z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matches…"
            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-4">
        {isLoading ? (
          <div className="flex justify-center pt-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center mt-12 px-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {search ? "No results found" : "No Matches Yet"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {search
                ? `No matches named "${search}".`
                : "Keep swiping to find people who like you back. Your perfect match is just a swipe away!"}
            </p>
            {!search && (
              <Link href="/discover">
                <button className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg hover:-translate-y-0.5 transition-transform text-sm">
                  Go to Discover
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="px-4 divide-y divide-border/50">
            {filtered.map((match) => {
              const profile = match.profile;
              if (!profile) return null;
              const imageUrl =
                profile.photos?.[0] ||
                `${import.meta.env.BASE_URL}images/placeholder-avatar.png`;

              return (
                <Link key={match.id} href={`/chat/${match.id}`}>
                  <div className="flex items-center gap-4 py-4 cursor-pointer group">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors">
                        <img
                          src={imageUrl}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {match.unreadCount && match.unreadCount > 0 ? (
                        <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">
                            {match.unreadCount > 9 ? "9+" : match.unreadCount}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2 mb-0.5">
                        <h3 className="font-bold text-foreground text-base truncate group-hover:text-primary transition-colors">
                          {profile.name}
                        </h3>
                        {match.lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {formatDistanceToNow(new Date(match.lastMessage.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate ${match.lastMessage ? "text-muted-foreground" : "text-primary/80 italic"}`}>
                        {match.lastMessage
                          ? match.lastMessage.content
                          : "Say hi to your new match!"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
