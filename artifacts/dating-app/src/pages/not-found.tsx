import { Link } from "wouter";
import { HeartCrack } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 text-center">
      <div className="w-24 h-24 mb-6 rounded-full glass flex items-center justify-center text-primary/50">
        <HeartCrack className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-display font-bold text-white mb-2">404</h1>
      <p className="text-muted-foreground mb-8">
        Looks like this connection was lost. We couldn't find the page you're looking for.
      </p>
      <Link href="/">
        <button className="px-8 py-3 rounded-full bg-primary text-white font-bold shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 transition-transform">
          Return Home
        </button>
      </Link>
    </div>
  );
}
