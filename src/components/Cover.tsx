import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LOCATIONS, LocationData } from '../constants';
import { auth, db, getDirectImageUrl } from '../lib/firebase';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { X, ArrowRight } from 'lucide-react';

interface CoverProps {
  onEnter: () => void;
}

const Cover: React.FC<CoverProps> = ({ onEnter }) => {
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<LocationData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>(LOCATIONS);
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1612975526661-74d4b17f5255?q=80&w=2070&auto=format&fit=crop');

  const displayLocations = locations.filter(loc => !['pure-utopia', 'sealed-realm', 'hyakki-yakou'].includes(loc.id));

  useEffect(() => {
    // Sync settings
    const unsubSettings = onSnapshot(doc(db, 'config', 'general'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.coverBackgroundUrl) {
          setBgUrl(getDirectImageUrl(data.coverBackgroundUrl));
        }
      }
    });

    // Sync locations
    const unsubLocs = onSnapshot(collection(db, 'locations'), (snap) => {
      if (!snap.empty) {
        const fetched = snap.docs.map(d => d.data() as LocationData);
        const merged = LOCATIONS.map(base => {
          const remote = fetched.find(f => f.id === base.id);
          return remote ? { ...base, ...remote } : { ...base };
        });
        setLocations(merged);
      }
    });

    // Auto-cycle for mobile/non-hovered states
    const cycleInterval = setInterval(() => {
      if (!hoveredPanel) {
        setCycleIndex(prev => (prev + 1) % displayLocations.length);
      }
    }, 4500);

    return () => {
      unsubSettings();
      unsubLocs();
      clearInterval(cycleInterval);
    };
  }, [hoveredPanel, displayLocations.length]);

  return (
    <div id="cover-container" className="relative w-full h-screen overflow-hidden bg-black flex flex-col font-sans">
      {/* Background Section */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-80 scale-100 transition-all duration-1000"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/80 z-10" />
      
      {/* Top Right Logo */}
      <div className="fixed top-8 right-8 md:top-12 md:right-12 z-50 pointer-events-none">
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="https://images4.imagebam.com/66/ac/4b/ME1CNC1B_o.png"
          alt="FREESOUL LOGO"
          className="w-32 md:w-48 h-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Top Brand Area */}
      <div className="relative z-20 flex flex-col items-center pt-8 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <span className="text-white/40 tracking-[0.5em] text-[8px] md:text-sm uppercase mb-2">FreeSoul Music Presents</span>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
             <div className="w-8 md:w-12 h-0.5 bg-white/20" />
             <h1 className="text-3xl md:text-6xl font-bold tracking-tighter text-white drop-shadow-2xl">
                SONIC <span className="text-ink-soft">UNIVERSE</span>
             </h1>
             <div className="w-8 md:w-12 h-0.5 bg-white/20" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={onEnter}
              className="group relative px-8 md:px-10 py-2.5 md:py-3 cursor-pointer"
            >
               <div className="absolute inset-0 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/40 transition-all skew-x-[-15deg]" />
               <span className="relative z-10 text-white font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">Enter Music Studio</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Panels Area - Occupying Lower Half */}
      <div className="relative z-20 flex-1 flex items-end justify-center px-0 overflow-hidden">
        <div className="flex w-full h-[58vh] md:h-[60vh] translate-y-4">
          {displayLocations.map((loc, index) => {
            const isActive = hoveredPanel === loc.id || (!hoveredPanel && displayLocations[cycleIndex]?.id === loc.id);
            
            return (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 1 }}
                onMouseEnter={() => setHoveredPanel(loc.id)}
                onMouseLeave={() => setHoveredPanel(null)}
                onClick={() => {
                  // On mobile, first click expands, second click opens detail
                  if (window.innerWidth < 768) {
                    if (hoveredPanel === loc.id) {
                      setSelectedCharacter(loc);
                    } else {
                      setHoveredPanel(loc.id);
                    }
                  } else {
                    setSelectedCharacter(loc);
                  }
                }}
                className={`relative group cursor-pointer overflow-hidden transition-all duration-700 ease-in-out border-r border-white/5 last:border-0
                  ${isActive ? 'flex-[6] md:flex-[8]' : 'flex-1'}
                `}
                style={{
                  skewX: '-15deg',
                  marginRight: '-1vw',
                }}
              >
                {/* Image Container - Unskewed inside */}
                <div 
                  className="absolute inset-y-0 h-full w-[120vh] left-1/2 -translate-x-1/2 transition-all duration-700 overflow-hidden pointer-events-none"
                  style={{ skewX: '15deg' }}
                >
                  {(loc.coverImage || loc.character.image) && (
                    <img 
                      src={getDirectImageUrl(loc.coverImage || loc.character.image)}
                      alt={loc.name}
                      className={`absolute inset-0 w-full h-full object-cover object-[center_15%] transition-all duration-700
                        ${isActive ? 'opacity-100 grayscale-0 scale-105' : 'opacity-40 grayscale scale-100'}
                      `}
                    />
                  )}
                  
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent transition-opacity duration-700
                    ${isActive ? 'opacity-30' : 'opacity-70'}
                  `} />
                </div>

                {/* Label inside strips */}
                <div 
                  className="absolute bottom-16 md:bottom-24 right-4 md:right-12 z-40 transition-all duration-500"
                  style={{ skewX: '15deg' }}
                >
                  <AnimatePresence>
                    {isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex flex-col items-end max-w-[200px] md:max-w-[320px] text-right"
                        >
                          <span className="text-accent text-[8px] md:text-[10px] uppercase tracking-widest mb-1 font-bold">{loc.nameEn || loc.id}</span>
                          <h3 className="text-white text-2xl md:text-4xl font-black tracking-tighter shadow-black drop-shadow-xl mb-2 md:mb-3 leading-none italic">{loc.characterName || loc.name}</h3>
                          <div className="w-8 md:w-12 h-1 bg-accent/50 mb-3 md:mb-4" />
                           <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-white/80 text-[11px] md:text-[13px] leading-relaxed font-medium line-clamp-3 md:line-clamp-4 italic"
                          >
                            {loc.description}
                          </motion.p>
                          
                          {/* Mobile Tap Indicator */}
                          <div className="mt-4 md:hidden flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/30 rounded-full">
                            <span className="text-accent text-[9px] font-bold uppercase tracking-wider">Tap again for profile</span>
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Character Detail Card Modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedCharacter(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedCharacter(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 aspect-square md:aspect-auto h-56 md:h-auto overflow-hidden bg-black/40 shrink-0">
                {(selectedCharacter.coverImage || selectedCharacter.character.image) && (
                  <img 
                    src={getDirectImageUrl(selectedCharacter.coverImage || selectedCharacter.character.image)} 
                    alt={selectedCharacter.characterName || selectedCharacter.name} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:hidden" />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-6 md:p-12 pb-0 shrink-0">
                  <div className="mb-6">
                    <span className="text-secondary text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-2 block opacity-60">
                      {selectedCharacter.characterTitle || "島嶼守護者"} · {selectedCharacter.name}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2 italic">
                      {selectedCharacter.characterName || selectedCharacter.name}
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-accent to-transparent" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-scroll custom-scrollbar px-6 md:px-12 overscroll-contain">
                  <div className="py-4">
                    <p className="text-white/80 text-base md:text-lg leading-relaxed font-medium italic mb-8">
                      「{selectedCharacter.description}」
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-1 font-bold">Location</span>
                        <span className="text-xs md:text-sm text-white/80 font-bold">{selectedCharacter.nameEn || selectedCharacter.id}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-1 font-bold">Status</span>
                        <span className={`text-xs md:text-sm font-bold ${selectedCharacter.underConstruction ? 'text-amber-400' : 'text-accent'}`}>
                          {selectedCharacter.underConstruction ? 'Sealed' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-12 pt-0 shrink-0 mt-auto">
                  <button 
                    onClick={() => {
                      setSelectedCharacter(null);
                      onEnter();
                    }}
                    className="w-full py-4 bg-accent text-black font-black uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    進入FreeSoul宇宙 →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Padding */}
      <div className="h-12 w-full" />
    </div>
  );
};

export default Cover;
