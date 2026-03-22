import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Send, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useGetMatch, useGetMessages, useSendMessage, useGetCurrentUser } from "@workspace/api-client-react";
import { clsx } from "clsx";

export default function Chat() {
  const [, params] = useRoute("/chat/:matchId");
  const matchId = params?.matchId || "";
  
  const { data: user } = useGetCurrentUser();
  const { data: match } = useGetMatch(matchId, { query: { enabled: !!matchId } });
  
  // Poll messages every 3s
  const { data: messages } = useGetMessages(matchId, { limit: 100 }, { 
    query: { enabled: !!matchId, refetchInterval: 3000 } 
  });
  
  const { mutate: sendMessage, isPending } = useSendMessage();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    
    sendMessage(
      { matchId, data: { content: input.trim() } },
      { onSuccess: () => setInput("") }
    );
  };

  const profile = match?.profile;
  const avatarUrl = profile?.photos?.[0] || `${import.meta.env.BASE_URL}images/placeholder-avatar.png`;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background absolute inset-0 z-50">
      {/* Header */}
      <header className="glass-panel border-t-0 border-b flex items-center justify-between px-4 py-3 shrink-0 pt-safe">
        <div className="flex items-center gap-3">
          <Link href="/matches">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          
          {profile && (
            <Link href={`/profiles/${profile.id}`}>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-primary transition-colors">
                  <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-bold text-white leading-tight">{profile.name}</h2>
                  <p className="text-xs text-primary font-medium">Matched</p>
                </div>
              </div>
            </Link>
          )}
        </div>
        
        <button className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar"
      >
        <div className="text-center py-6 text-muted-foreground text-xs">
          You matched with {profile?.name}
          <div className="mt-1">Send a message to start the conversation!</div>
        </div>

        {messages?.slice().reverse().map((msg, idx, arr) => {
          const isMe = msg.senderId === user?.id;
          const showTime = idx === 0 || new Date(msg.createdAt).getTime() - new Date(arr[idx-1].createdAt).getTime() > 1000 * 60 * 5;

          return (
            <div key={msg.id} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
              {showTime && (
                <span className="text-[10px] text-muted-foreground mb-2 px-2">
                  {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                </span>
              )}
              <div className={clsx(
                "max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                isMe 
                  ? "bg-gradient-to-br from-primary to-accent text-white rounded-tr-sm shadow-[0_4px_15px_rgba(244,63,94,0.2)]" 
                  : "bg-card border border-white/5 text-white/90 rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 glass-panel border-b-0 border-t pb-safe">
        <form onSubmit={handleSend} className="flex items-end gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-input/50 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none max-h-32 min-h-[48px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isPending}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
