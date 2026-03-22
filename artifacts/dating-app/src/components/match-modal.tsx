import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useLocation } from "wouter";
import type { Profile } from "@workspace/api-client-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchProfile?: Profile | null;
  matchId?: string;
}

export function MatchModal({ isOpen, onClose, matchProfile, matchId }: MatchModalProps) {
  const [, setLocation] = useLocation();

  if (!matchProfile) return null;

  const imageUrl = matchProfile.photos?.[0] || `${import.meta.env.BASE_URL}images/placeholder-avatar.png`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
            className="relative z-10 flex flex-col items-center w-full max-w-sm"
          >
            <h2 className="font-display text-5xl font-bold italic text-gradient mb-12 transform -rotate-6">
              It's a Match!
            </h2>

            <div className="relative w-48 h-48 mb-12">
              <motion.div
                initial={{ x: -100, rotate: -20, opacity: 0 }}
                animate={{ x: -40, rotate: -10, opacity: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.3 }}
                className="absolute top-0 left-0 w-32 h-32 rounded-full border-4 border-background shadow-2xl overflow-hidden bg-muted"
              >
                <img src={`${import.meta.env.BASE_URL}images/placeholder-avatar.png`} className="w-full h-full object-cover" alt="You" />
              </motion.div>

              <motion.div
                initial={{ x: 100, rotate: 20, opacity: 0 }}
                animate={{ x: 40, rotate: 10, opacity: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.4 }}
                className="absolute top-8 right-0 w-40 h-40 rounded-full border-4 border-background shadow-2xl overflow-hidden bg-muted z-10"
              >
                <img src={imageUrl} className="w-full h-full object-cover" alt={matchProfile.name} />
              </motion.div>

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.6 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-primary w-12 h-12 rounded-full flex items-center justify-center border-4 border-background shadow-lg shadow-primary/50"
              >
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.div>
            </div>

            <p className="text-white/80 text-center mb-10 text-lg">
              You and <span className="font-bold text-white">{matchProfile.name}</span> have liked each other.
            </p>

            <div className="flex flex-col w-full gap-4">
              <button 
                onClick={() => {
                  onClose();
                  if (matchId) setLocation(`/chat/${matchId}`);
                }}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Say Hello
                </span>
              </button>
              
              <button 
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
