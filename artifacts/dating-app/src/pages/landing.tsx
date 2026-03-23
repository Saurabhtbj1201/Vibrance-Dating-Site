import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, Heart, Play, Pause, Circle, MessageCircle, HeartCrack } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#E8EBF7] to-[#F0F2FA] text-foreground flex flex-col items-center selection:bg-primary selection:text-white">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />
      
      {/* Scattered Shapes */}
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, 10, 0] }} 
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-32 left-32 w-4 h-4 rounded-full border-2 border-primary/40"
      />
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, -15, 0] }} 
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
        className="absolute top-48 right-1/4 w-3 h-3 bg-accent/40 rotate-45"
      />
      <motion.div 
        animate={{ y: [0, 25, 0], scale: [1, 1.2, 1] }} 
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-48 left-1/4 w-2 h-2 rounded-full bg-blue-400/50"
      />
      
      {/* Navbar */}
      <header className="w-full px-6 lg:px-10 xl:px-16 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Vibrance" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-primary/30" />
          <span className="text-2xl font-display font-bold text-primary">Vibrance</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Discover</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">App</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</a>
        </nav>
        
        <div className="flex items-center">
          <Link href="/auth">
            <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white px-6 transition-all duration-300">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 w-full px-6 lg:px-10 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 pt-10 pb-20">
        
        {/* Left Content */}
        <div className="flex flex-col items-start text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-extrabold text-[#232049] leading-[1.1] tracking-tight">
              Love Is <br/>
              <span className="text-[#232049]">All Around</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed"
          >
            A modern dating experience designed for genuine chemistry and real connections.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="pt-4"
          >
            <Link href="/auth">
              <button className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-lg shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_40px_rgba(244,63,94,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 group">
                Start Matching
                <Heart className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              </button>
            </Link>
          </motion.div>
          
          {/* Social / Extra Icons Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            className="flex items-center gap-4 pt-10"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary cursor-pointer hover:scale-105 transition-transform">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-accent cursor-pointer hover:scale-105 transition-transform">
              <Pause className="w-5 h-5 fill-current" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-blue-400 cursor-pointer hover:scale-105 transition-transform">
              <Circle className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-green-400 cursor-pointer hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
          </motion.div>
        </div>

        {/* Right Illustration */}
        <div className="relative h-[600px] flex items-center justify-center w-full mt-10 lg:mt-0">
          
          {/* Botanical SVG Background */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
            <svg viewBox="0 0 200 200" className="w-[120%] h-[120%] text-accent/30 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M42.7,-73.4C55.9,-67.8,67.6,-56.9,76.4,-43.7C85.2,-30.5,91,-15.2,88.9,-1.1C86.7,13.1,76.5,26.2,66.6,37.8C56.6,49.4,46.9,59.6,34.7,66.4C22.5,73.2,7.8,76.7,-5.7,73.5C-19.1,70.2,-38.2,60.3,-52.1,50.1C-66,39.9,-74.6,29.3,-79.8,16.5C-85,3.7,-86.7,-11.2,-81.4,-23.5C-76.1,-35.8,-63.7,-45.5,-50.8,-51.7C-37.8,-57.9,-24.3,-60.7,-10.8,-63C2.8,-65.4,15.6,-67.2,29.3,-71.4Z" transform="translate(100 100)" />
            </svg>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            transition={{ duration: 1, type: "spring" }}
            className="absolute left-[5%] top-[10%] z-10 w-64 h-[450px] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-white overflow-hidden"
          >
            <div className="w-full h-full relative rounded-[2rem] overflow-hidden bg-gray-100">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80" alt="Woman profile" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-white font-bold text-xl">Sarah, 24</h3>
                <p className="text-white/80 text-sm">Designer</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
            animate={{ opacity: 1, scale: 1, rotate: 10 }}
            transition={{ duration: 1, type: "spring", delay: 0.2 }}
            className="absolute right-[5%] top-[20%] z-20 w-64 h-[450px] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-white overflow-hidden"
          >
            <div className="w-full h-full relative rounded-[2rem] overflow-hidden bg-gray-100">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80" alt="Man profile" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-white font-bold text-xl">Michael, 27</h3>
                <p className="text-white/80 text-sm">Photographer</p>
              </div>
            </div>
          </motion.div>

          {/* Floating Hearts Animation */}
          <motion.div
            animate={{ y: [-10, -50], opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
            className="absolute z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-primary text-white p-3 rounded-full shadow-xl">
              <Heart className="w-8 h-8 fill-current" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -40], x: [0, -20], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: 1, ease: "easeOut" }}
            className="absolute z-30 top-[30%] left-[30%]"
          >
            <Heart className="w-6 h-6 text-primary/80 fill-current" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -30], x: [0, 30], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, delay: 2, ease: "easeOut" }}
            className="absolute z-30 top-[40%] right-[30%]"
          >
            <Heart className="w-5 h-5 text-accent/80 fill-current" />
          </motion.div>
          
        </div>
      </main>

      {/* Bottom Tagline */}
      <footer className="w-full pb-16 pt-8 text-center relative z-10">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-cursive italic text-2xl text-secondary mb-2"
        >
          love is all around
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-display font-extrabold text-[#232049] tracking-tight"
        >
          New Dating App
        </motion.h2>
      </footer>
    </div>
  );
}
