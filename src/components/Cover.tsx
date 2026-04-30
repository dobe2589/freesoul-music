import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LOCATIONS, LocationData } from '../constants';
import { auth, db, getDirectImageUrl } from '../lib/firebase';
import { doc, collection, onSnapshot } from 'firebase/firestore';

interface CoverProps {
  onEnter: () => void;
}

const Cover: React.FC<CoverProps> = ({ onEnter }) => {
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<LocationData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>(LOCATIONS);
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1612975526661-74d4b17f5255?q=80&w=2070&auto=format&fit=crop');

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

    return () => {
      unsubSettings();
      unsubLocs();
    };
  }, []);

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
      <div className="relative z-20 flex flex-col items-center pt-12 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <span className="text-white/40 tracking-[0.5em] text-[10px] md:text-sm uppercase mb-2">FreeSoul Music Presents</span>
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-0.5 bg-white/20" />
             <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white drop-shadow-2xl">
               SONIC <span className="text-ink-soft">UNIVERSE</span>
             </h1>
             <div className="w-12 h-0.5 bg-white/20" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={onEnter}
              className="group relative px-10 py-3 cursor-pointer"
            >
               <div className="absolute inset-0 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/40 transition-all skew-x-[-15deg]" />
               <span className="relative z-10 text-white font-bold tracking-[0.4em] uppercase text-xs">Enter Music Studio</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Panels Area - Occupying Lower Half */}
      <div className="relative z-20 flex-1 flex items-end justify-center px-0 overflow-hidden">
        <div className="flex w-full h-[55vh] md:h-[60vh] translate-y-4">
          {locations
            .filter(loc => !['pure-utopia', 'sealed-realm', 'hyakki-yakou'].includes(loc.id))
            .map((loc, index) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 1 }}
              onMouseEnter={() => setHoveredPanel(loc.id)}
              onMouseLeave={() => setHoveredPanel(null)}
              onClick={() => setSelectedCharacter(loc)}
              className={`relative flex-1 group cursor-pointer overflow-hidden transition-all duration-700 ease-in-out border-r border-white/5 last:border-0
                ${hoveredPanel === loc.id ? 'flex-[6]' : 'flex-1'}
              `}
              style={{
                skewX: '-15deg',
                marginRight: '-1vw',
              }}
            >
              {/* Image Container - Unskewed inside */}
              <div 
                className="absolute inset-y-0 h-full w-[100vh] left-1/2 -translate-x-1/2 transition-all duration-700 overflow-hidden pointer-events-none"
                style={{ skewX: '15deg' }}
              >
                {(loc.coverImage || loc.character.image) && (
                  <img 
                    src={getDirectImageUrl(loc.coverImage || loc.character.image)}
                    alt={loc.name}
                    className={`absolute inset-0 w-full h-full object-cover object-[center_15%] transition-all duration-700
                      ${hoveredPanel === loc.id ? 'opacity-100 grayscale-0' : 'opacity-60 grayscale'}
                    `}
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-50 group-hover:opacity-10 transition-opacity" />
              </div>

              {/* Label inside strips */}
              <div 
                className="absolute bottom-24 right-12 z-40 transition-all duration-500"
                style={{ skewX: '15deg' }}
              >
                <AnimatePresence>
                  {hoveredPanel === loc.id && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col items-end max-w-[320px] text-right"
                      >
                        <span className="text-accent text-[10px] uppercase tracking-widest mb-1 font-bold">{loc.nameEn || loc.id}</span>
                        <h3 className="text-white text-4xl font-black tracking-tighter shadow-black drop-shadow-xl mb-3 leading-none italic">{loc.characterName || loc.name}</h3>
                        <div className="w-12 h-1 bg-accent/50 mb-4" />
                         <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-white/80 text-[13px] leading-relaxed font-medium line-clamp-4 italic"
                        >
                          {loc.description}
                        </motion.p>
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Character Detail Card Modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedCharacter(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedCharacter(null)}
                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                ✕
              </button>

              <div className="w-full md:w-1/2 aspect-square md:aspect-auto h-64 md:h-auto overflow-hidden bg-black/40">
                {(selectedCharacter.coverImage || selectedCharacter.character.image) && (
                  <img 
                    src={getDirectImageUrl(selectedCharacter.coverImage || selectedCharacter.character.image)} 
                    alt={selectedCharacter.characterName} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-transparent" />
              </div>

              <div className="flex-1 p-8 md:p-12 flex flex-col">
                <div className="mb-6">
                  <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-2 block opacity-60">岛屿守護者 · {selectedCharacter.name}</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2 italic">
                    {selectedCharacter.characterName}
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent to-transparent" />
                </div>

                <div className="flex-1">
                  <p className="text-white/80 text-lg leading-relaxed font-medium italic mb-8">
                    「{selectedCharacter.description}」
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-1 font-bold">Location</span>
                      <span className="text-sm text-white/80 font-bold">{selectedCharacter.nameEn}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-1 font-bold">Status</span>
                      <span className={`text-sm font-bold ${selectedCharacter.underConstruction ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {selectedCharacter.underConstruction ? 'Sealed' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedCharacter(null);
                    onEnter();
                  }}
                  className="w-full py-4 bg-accent text-black font-black uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  進入島嶼領域 →
                </button>
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
