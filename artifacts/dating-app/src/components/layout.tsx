import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Heart, User, Flame, Sparkles, Compass } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  const showNav =
    isAuthenticated &&
    !['/', '/auth'].includes(location) &&
    !location.startsWith('/chat/') &&
    !location.startsWith('/admin') &&
    !location.startsWith('/verification');

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Flame className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-md mx-auto relative bg-background shadow-2xl shadow-black/50 overflow-hidden">

      {/* Header */}
      {showNav && (
        <header className="px-5 pt-12 pb-3 border-b border-white/5 bg-background z-40 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Vibrance" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-display font-bold text-2xl tracking-tight text-gradient">Vibrance</span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 relative w-full h-full flex flex-col",
        showNav ? "pb-24" : ""
      )}>
        {children}
      </main>

      {/* Bottom Navigation — 5 tabs */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50">
          <div className="bg-card/95 backdrop-blur-2xl border-t border-white/8 pb-safe pt-2 px-1">
            <ul className="flex justify-around items-center pb-2">
              <NavItem href="/discover"   icon={<Flame   className="w-5 h-5" />} label="Home"     active={location === '/discover'} />
              <NavItem href="/browse"     icon={<Compass className="w-5 h-5" />} label="Discover" active={location === '/browse'} />
              <NavItem href="/matches"    icon={<Heart   className="w-5 h-5" />} label="Matches"  active={location.startsWith('/matches')} />
              <NavItem href="/liked"      icon={<Sparkles className="w-5 h-5" />} label="Liked"   active={location === '/liked'} />
              <NavItem href="/profile"    icon={<User    className="w-5 h-5" />} label="Profile"  active={location === '/profile'} />
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
}

function NavItem({ href, icon, label, active }: {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <li className="flex-1">
      <Link href={href} className={cn(
        "flex flex-col items-center gap-0.5 transition-all duration-200 py-1 rounded-xl",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}>
        <div className={cn(
          "p-1.5 rounded-xl transition-all duration-200",
          active ? "bg-primary/15" : ""
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-[9px] font-semibold tracking-wide transition-all duration-200",
          active ? "opacity-100 text-primary" : "opacity-55"
        )}>
          {label.toUpperCase()}
        </span>
      </Link>
    </li>
  );
}
