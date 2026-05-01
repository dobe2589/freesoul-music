/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LOCATIONS, LocationData } from './constants';
import { X, Youtube, Music, ExternalLink, Star, Shield, ChevronLeft } from 'lucide-react';
import Cover from './components/Cover';
import Admin from './components/Admin';
import { db, getDirectImageUrl } from './lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [view, setView] = useState<'cover' | 'map'>('cover');
  const [locations, setLocations] = useState<LocationData[]>(LOCATIONS);
  const mapLocations = locations.filter(loc => !loc.isArchive);
  const archiveLocations = locations.filter(loc => loc.isArchive);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
  const [mapBg, setMapBg] = useState('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');

  useEffect(() => {
    // Check hash for direct access
    if (window.location.hash === '#map') {
      setView('map');
    }
    
    // Real-time updates for locations from Firebase
    const unsubLocs = onSnapshot(collection(db, 'locations'), (snap) => {
      if (!snap.empty) {
        const fetched = snap.docs.map(d => d.data() as LocationData);
        
        // Use fetched data as primary source
        // Combine with any local defaults that might not be in DB yet
        const remoteIds = new Set(fetched.map(f => f.id));
        const missingFromRemote = LOCATIONS.filter(l => !remoteIds.has(l.id));
        
        const merged = [...fetched, ...missingFromRemote];
        
        // Sort if needed or just set
        setLocations(merged);
      }
    });

    const unsubSettings = onSnapshot(doc(db, 'config', 'general'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.mapBackgroundUrl) {
          setMapBg(getDirectImageUrl(data.mapBackgroundUrl));
        }
      }
    });

    return () => {
      unsubLocs();
      unsubSettings();
    };
  }, []);

  const handleLocationClick = (loc: LocationData) => {
    setSelectedLocation(loc);
  };

  const goToMap = () => {
    setView('map');
    window.location.hash = 'map';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToCover = () => {
    setView('cover');
    window.location.hash = '';
  };

  return (
    <div className="relative min-h-screen bg-[#050510] font-sans selection:bg-accent/30 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'cover' ? (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Cover onEnter={goToMap} />
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth custom-scrollbar overflow-x-hidden"
          >
            {/* Back Button */}
            <button 
              onClick={goToCover}
              className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white/60 hover:text-white"
            >
              <ChevronLeft size={16} />
              <span className="text-[10px] font-bold tracking-widest uppercase">返回封面</span>
            </button>

            {/* Admin Toggle (Bottom Left) */}
            {!showAdmin && (
              <button 
                onClick={() => setShowAdmin(true)}
                className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white/40 hover:text-white group"
                title="管理後台"
              >
                <Shield size={16} className="group-hover:text-accent transition-colors" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Admin</span>
              </button>
            )}

            {/* Main Map Section */}
            <section className="min-h-screen w-full relative snap-start flex flex-col items-center">
              {/* Dynamic Background */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(80,40,140,0.4)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(20,80,140,0.35)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(15,5,40,1)_0%,#050510_100%)]" />
                <Starfield />
              </div>

              <div className="relative z-10 flex flex-col items-center w-full">
                <header className="py-12 md:py-20 px-8 text-center">
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-4xl md:text-7xl font-bold tracking-[0.15em] mb-4 bg-gradient-to-r from-accent via-gold to-accent-warm bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(122,240,255,0.3)]"
                  >
                    FREESOUL MUSIC
                  </motion.h1>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <span className="text-ink-soft text-xs md:text-base tracking-[0.5em] uppercase">音樂宇宙</span>
                    <p className="flex items-center gap-4 text-ink-soft opacity-70 text-[10px] md:text-xs">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span>將滑鼠移至地點(或觸碰)以召喚守護者 · 再次點擊查看詳情</span>
                      <Star className="w-3 h-3 text-gold fill-gold" />
                    </p>
                  </motion.div>
                </header>

                {/* Map Wrapper */}
                <div className="w-full max-w-7xl px-0 md:px-8 mb-20">
                  <div className="overflow-x-auto pb-8 mask-fade-edges md:mask-none custom-scrollbar">
                    <div 
                      className="relative min-w-[1000px] md:min-w-0 w-full aspect-[1366/768] md:rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-cover bg-center transition-all duration-1000"
                      style={{ backgroundImage: `url('${mapBg}')` }}
                      onClick={() => setHoveredLocationId(null)}
                    >
                      {mapLocations.map((loc) => (
                        <div
                          key={loc.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                          style={{
                            left: `${loc.hitArea.x + loc.hitArea.w / 2}%`,
                            top: `${loc.hitArea.y + loc.hitArea.h / 2}%`,
                            width: `${loc.hitArea.w}%`,
                            height: `${loc.hitArea.h}%`,
                          }}
                          onMouseEnter={() => setHoveredLocationId(loc.id)}
                          onMouseLeave={() => setHoveredLocationId(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hoveredLocationId === loc.id) {
                              handleLocationClick(loc);
                            } else {
                              setHoveredLocationId(loc.id);
                            }
                          }}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(122,240,255,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
                          <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded text-[11px] opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-40 pointer-events-none flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                              {loc.underConstruction && <span>🔒</span>}
                              {loc.name}
                            </div>
                            {hoveredLocationId === loc.id && (
                              <div className="text-[8px] text-accent font-bold animate-pulse">TAP AGAIN TO VIEW</div>
                            )}
                          </div>
                        </div>
                      ))}

                      <AnimatePresence>
                        {mapLocations.map((loc) => (
                          (hoveredLocationId === loc.id && !loc.underConstruction) && (
                            <motion.div
                              key={`char-${loc.id}`}
                              initial={{ opacity: 0, scale: 0.5, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.5, y: 20 }}
                              transition={{ type: "spring", damping: 15 }}
                              className="absolute z-40 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                              style={{
                                left: `${loc.character.x}%`,
                                top: `${loc.character.y}%`,
                                width: `${loc.character.width}%`,
                              }}
                            >
                              {loc.sceneImage && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1.1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="absolute inset-x-[-120%] inset-y-[-60%] bg-cover bg-center rounded-[50px] pointer-events-none"
                                  style={{ 
                                    backgroundImage: `url('${getDirectImageUrl(loc.sceneImage)}')`,
                                    zIndex: -1,
                                    boxShadow: '0 0 40px rgba(0,0,0,0.4), inset 0 0 60px rgba(0,0,0,0.4)'
                                  }}
                                />
                              )}
                              {loc.character.image && (
                                <motion.img
                                  animate={{ y: [0, -10, 0] }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                  src={getDirectImageUrl(loc.character.image)}
                                  alt={loc.name}
                                  className="w-full drop-shadow-[0_0_20px_rgba(122,240,255,0.4)]"
                                />
                              )}
                            </motion.div>
                          )
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 py-8">
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-white/20 flex flex-col items-center gap-2"
                  >
                    <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black italic">Scroll Down · 舊音軌存放區</span>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Archive Section */}
            <section className="min-h-screen w-full relative snap-start flex flex-col items-center justify-center py-20 px-4 md:px-12 bg-black overflow-hidden">
              <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1a1040_0%,transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#102040_0%,transparent_40%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
              </div>

              <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
                >
                  <div className="relative mb-12 drop-shadow-[0_0_80px_rgba(122,240,255,0.2)]">
                    <motion.img 
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      src="https://images4.imagebam.com/81/69/51/ME1CNTXK_o.png" 
                      alt="Archive Building"
                      className="w-80 md:w-[600px] relative z-10"
                    />
                  </div>
                  <div className="space-y-6">
                    <h2 className="font-display text-5xl md:text-7xl text-white tracking-[0.2em] uppercase italic leading-none">
                      舊音軌存放區
                    </h2>
                    <div className="w-32 h-1.5 bg-gradient-to-r from-accent to-transparent rounded-full mx-auto lg:mx-0" />
                    <p className="text-white/40 text-sm md:text-lg max-w-xl font-light italic leading-relaxed">
                      「在數據與記憶迴響的裂隙中，存放著曾經引領島嶼前行的古老旋律。每一張唱片，都是一段時光與情感的載體。」
                    </p>
                  </div>
                </motion.div>

                <div className="w-full lg:w-1/2 h-[600px] lg:h-[750px] overflow-y-auto custom-scrollbar pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 pb-20">
                    {archiveLocations.map((loc, idx) => (
                      <motion.div 
                        key={loc.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center gap-6 group cursor-pointer"
                        onClick={() => handleLocationClick(loc)}
                      >
                        <div className="relative w-full aspect-square">
                          <div className="absolute inset-4 bg-accent/20 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="relative aspect-square rounded-full bg-black shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10 flex items-center justify-center">
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,transparent_40%,white_41%,transparent_42%)] bg-[length:12px_12px]" />
                            <div className="absolute inset-[10%] opacity-10 border-2 border-white rounded-full" />
                            <div className="absolute inset-[20%] opacity-10 border-2 border-white rounded-full" />
                            <div className="absolute inset-[30%] bg-accent/10 rounded-full border border-white/20 overflow-hidden flex items-center justify-center">
                              {loc.sceneImage ? (
                                <div 
                                  className="w-full h-full bg-cover bg-center opacity-80"
                                  style={{ backgroundImage: `url('${getDirectImageUrl(loc.sceneImage)}')` }}
                                />
                              ) : (
                                <Music className="w-8 h-8 text-white/20" />
                              )}
                              <div className="absolute inset-0 bg-black/30" />
                              <div className="absolute w-3 h-3 bg-black rounded-full" />
                            </div>
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.08)_20deg,transparent_40deg)] opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                        </div>
                        <div className="text-center px-4 w-full">
                          <div className="text-[9px] uppercase tracking-[0.3em] text-accent font-black italic mb-2 opacity-50 truncate">{loc.nameEn || 'MEMORIES'}</div>
                          <div className="text-sm md:text-base font-bold text-white group-hover:text-accent transition-colors leading-tight truncate">{loc.name}</div>
                        </div>
                      </motion.div>
                    ))}

                    {archiveLocations.length === 0 && (
                      <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-6">
                        <Music className="w-12 h-12 text-white/10" />
                        <p className="text-white/20 text-xs tracking-widest uppercase italic">存放區中尚無紀錄</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {selectedLocation && (
          <Modal location={selectedLocation} onClose={() => setSelectedLocation(null)} />
        )}
        {showAdmin && (
          <Admin onClose={() => setShowAdmin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ location, onClose }: { location: LocationData, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-xl overflow-hidden"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 w-12 h-12 rounded-full glass flex items-center justify-center transition-transform hover:rotate-90 z-[120]"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="relative max-w-6xl w-full max-h-[90vh] md:max-h-[85vh] flex flex-col md:flex-row items-stretch glass rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {location.underConstruction ? (
          <div className="w-full text-center py-20 px-6">
            <span className="text-8xl mb-8 block animate-bounce">🔧</span>
            <h2 className="font-display text-4xl text-gold mb-6 tracking-widest uppercase text-white">Under Construction</h2>
            <p className="text-ink-soft text-lg max-w-lg mx-auto leading-loose">
              「{location.name}」尚未開放<br />請耐心等待，新的旋律即將降臨...
            </p>
          </div>
        ) : (
          <>
            {/* Left side fixed visuals */}
            <div className="w-full md:w-[40%] bg-black/30 relative flex items-center justify-center p-8 md:p-12 shrink-0 overflow-hidden">
              {location.sceneImage && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm scale-110"
                  style={{ backgroundImage: `url('${getDirectImageUrl(location.sceneImage)}')` }}
                />
              )}
              <div className="relative flex-shrink-0 group w-full max-w-[320px]">
                {location.sceneImage ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center rounded-3xl opacity-90 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
                    style={{ backgroundImage: `url('${getDirectImageUrl(location.sceneImage)}')` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full animate-pulse" />
                )}
                
                {location.character.image && (
                  <motion.img 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    src={getDirectImageUrl(location.character.image)} 
                    alt={location.name}
                    className="relative w-full z-10 drop-shadow-[0_0_40px_rgba(122,240,255,0.4)]"
                  />
                )}
              </div>
            </div>

            {/* Right side scrollable info */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-16 text-center md:text-left">
              <span className="font-display text-xs tracking-[0.4em] text-accent mb-2 block uppercase opacity-60">
                {location.nameEn}
              </span>
              <h2 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                {location.characterName}
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-8 font-bold">
                {location.characterTitle || '島嶼守護者'} · {location.name}
              </p>
              
              <div className="w-16 h-0.5 bg-accent/30 mb-8 mx-auto md:mx-0" />
              
              <p className="text-white/80 text-base md:text-lg leading-relaxed tracking-wide mb-12 italic">
                「{location.description}」
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {(!location.playlists || location.playlists.length === 0) && location.playlist && (
                  <a 
                    href={location.playlist} 
                    target="_blank" 
                    rel="noopener"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ff0000] to-[#cc0000] px-8 py-4 rounded-lg text-white font-bold tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group"
                  >
                    <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    YOUTUBE 播放清單
                  </a>
                )}

                {location.playlists?.map((pl, idx) => (
                  <a 
                    key={idx}
                    href={pl.url} 
                    target="_blank" 
                    rel="noopener"
                    className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-4 rounded-lg text-white font-bold tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group"
                  >
                    <Youtube className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                    {pl.label || '播放清單'}
                  </a>
                ))}
              </div>

              {/* Audio Previews */}
              {location.audioPreviews && location.audioPreviews.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6 font-bold border-l-2 border-accent pl-4">試聽音軌</h3>
                  <div className="space-y-4">
                    {location.audioPreviews.map((audio, idx) => (
                      <div key={idx} className="glass p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 group hover:bg-white/5 transition-colors">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white mb-2">{audio.title}</div>
                          <audio controls className="w-full h-8 opacity-70 hover:opacity-100 transition-opacity">
                            <source src={audio.url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Players */}
              {location.videos && location.videos.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6 font-bold border-l-2 border-red-500 pl-4">影片撥放</h3>
                  <div className="space-y-6 pb-4">
                    {location.videos.map((video, idx) => {
                      const ytId = video.url.includes('youtube.com') || video.url.includes('youtu.be') 
                        ? (video.url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/) || [])[1] 
                        : null;

                      return (
                        <div key={idx} className="glass overflow-hidden rounded-2xl">
                          <div className="p-3 bg-white/5 border-b border-white/5">
                            <div className="text-xs font-bold text-white/60 tracking-wider uppercase">{video.title}</div>
                          </div>
                          {ytId ? (
                            <div className="aspect-video w-full bg-black">
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${ytId}`}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : (
                            <a href={video.url} target="_blank" rel="noopener" className="p-6 block hover:bg-white/5 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-white uppercase tracking-widest leading-none">External Video Link</div>
                                <ExternalLink className="w-4 h-4 text-accent" />
                              </div>
                              <p className="text-xs text-white/40 mt-3 truncate">{video.url}</p>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function Starfield() {
  return (
    <>
      {[...Array(80)].map((_, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: `${Math.random() * 3}px`,
            height: `${Math.random() * 3}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            opacity: Math.random() * 0.7 + 0.3
          }}
        />
      ))}
    </>
  );
}
