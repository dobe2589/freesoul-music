
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, getDirectImageUrl } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { TimelineEvent } from '../constants';
import { ChevronLeft, Youtube, Video, ExternalLink, Calendar, GitBranch, ArrowRight, X, PlayCircle } from 'lucide-react';

export default function Timeline({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'timeline'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ 
        ...d.data(), 
        id: d.id 
      }) as TimelineEvent);
      setEvents(fetched);
    });
    return unsub;
  }, []);

  const mainEvents = events.filter(e => !e.parentId);
  
  const getBranches = (parentId: string) => {
    return events.filter(e => e.parentId === parentId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] text-white overflow-hidden flex flex-col font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
          >
            <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">FreeSoul Universe Timeline</h1>
            <p className="text-[9px] md:text-[10px] text-accent font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-70">宇宙紀事 · 劇情時間軌</p>
          </div>
        </div>
      </header>

      {/* Timeline Content */}
      <main className="relative flex-1 overflow-x-auto overflow-y-auto custom-scrollbar p-4 md:p-20 scroll-smooth">
        <div className="min-w-0 md:min-w-[800px] max-w-5xl mx-auto relative px-4 md:px-0">
          
          {/* Central Vertical Line */}
          <div className="absolute left-[34px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/10 to-transparent -translate-x-1/2" />

          <div className="space-y-16 md:space-y-32 relative">
            {mainEvents.map((event, idx) => (
              <div key={event.id} className="relative">
                {/* Year Badge */}
                <div className="absolute left-[34px] md:left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 z-20">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className="bg-accent text-black text-[9px] md:text-[10px] font-black px-3 md:px-4 py-1 rounded-full shadow-[0_0_20px_rgba(122,240,255,0.4)]"
                  >
                    {event.year}
                  </motion.div>
                </div>

                {/* Main Event Card */}
                <div className={`flex items-start md:items-center ${idx % 2 === 0 ? 'flex-row' : 'md:flex-row-reverse'}`}>
                  <motion.div 
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className={`w-full md:w-1/2 pl-12 md:pl-0 ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}
                  >
                    <div 
                      onClick={() => setSelectedEvent(event)}
                      className="glass p-4 md:p-6 rounded-2xl border border-white/5 hover:border-accent/30 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className={`absolute top-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity ${idx % 2 === 0 ? 'md:right-0' : 'md:left-0'} left-0 md:hidden block`} />
                      {event.image && (
                        <div className="mb-4 aspect-video rounded-xl overflow-hidden bg-black/40">
                          <img src={getDirectImageUrl(event.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={event.title} />
                        </div>
                      )}
                      <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-accent transition-colors">{event.title}</h3>
                      <p className="text-white/40 text-xs md:text-sm line-clamp-2 italic">「{event.description}」</p>
                      
                      {event.media && event.media.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-[9px] md:text-[10px] text-accent font-bold uppercase tracking-widest">
                          <PlayCircle size={14} /> {event.media.length} 個媒體內容
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Connector Circle */}
                  <div className="absolute left-[34px] md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent z-10 shadow-[0_0_15px_rgba(122,240,255,0.6)]">
                    <div className="absolute inset-[-4px] rounded-full border border-accent/20 animate-ping" />
                  </div>

                  <div className="hidden md:block w-1/2" />
                </div>

                {/* Branches */}
                {getBranches(event.id).length > 0 && (
                  <div className="mt-8 md:mt-12 space-y-6 md:space-y-8">
                    {getBranches(event.id).map((branch, bIdx) => (
                      <div key={branch.id} className="relative flex items-center justify-start md:justify-center">
                        {/* Branch Connector */}
                        <svg className="absolute top-0 left-[34px] md:left-1/2 -translate-x-1/2 w-32 md:w-48 h-12 pointer-events-none" viewBox="0 0 200 50">
                          <path 
                            d={idx % 2 === 0 ? "M 100 0 Q 150 25 200 50" : "M 100 0 Q 50 25 0 50"} 
                            className="hidden md:block"
                            fill="none" 
                            stroke="rgba(122,240,255,0.2)" 
                            strokeWidth="2" 
                            strokeDasharray="4 4"
                          />
                          <path 
                            d="M 100 0 Q 120 25 140 50" 
                            className="md:hidden"
                            fill="none" 
                            stroke="rgba(122,240,255,0.2)" 
                            strokeWidth="2" 
                            strokeDasharray="4 4"
                          />
                        </svg>

                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          onClick={() => setSelectedEvent(branch)}
                          className={`relative z-20 group cursor-pointer pl-16 md:pl-0 ${idx % 2 === 0 ? 'md:ml-64' : 'md:mr-64'}`}
                        >
                          <div className="glass rounded-xl border border-white/5 hover:border-purple-500/30 transition-all overflow-hidden flex flex-col min-w-[180px] md:min-w-[200px] max-w-[240px] shadow-2xl">
                            {branch.image && (
                              <div className="aspect-video w-full overflow-hidden bg-black/40 border-b border-white/5">
                                <img 
                                  src={getDirectImageUrl(branch.image)} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  alt={branch.title} 
                                />
                              </div>
                            )}
                            <div className="p-4 flex items-center gap-4">
                              <div className="w-8 h-8 shrink-0 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <GitBranch size={16} />
                              </div>
                              <div>
                                <div className="text-[9px] text-purple-400 font-black uppercase tracking-widest mb-0.5">{branch.label || '分支事件'}</div>
                                <div className="text-xs font-bold group-hover:text-purple-300 transition-colors line-clamp-1">{branch.title}</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="h-64 flex items-center justify-center">
            <div className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-black italic">The Story Continues...</div>
          </div>
        </div>
      </main>

      {/* Modal Detail Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-12 relative custom-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X />
              </button>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="bg-accent text-black text-[10px] font-black px-3 py-1 rounded-full">{selectedEvent.year}</span>
                    {selectedEvent.type === 'branch' && (
                      <span className="bg-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Branch Story</span>
                    )}
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight">{selectedEvent.title}</h2>
                  <div className="w-12 h-1 bg-accent/30 rounded-full" />
                  <p className="text-white/70 leading-relaxed italic text-lg">「{selectedEvent.description}」</p>
                  
                  {selectedEvent.image && (
                    <img src={getDirectImageUrl(selectedEvent.image)} className="w-full rounded-2xl border border-white/10 shadow-2xl" alt={selectedEvent.title} />
                  )}
                </div>

                <div className="space-y-8">
                  {selectedEvent.media && selectedEvent.media.length > 0 && (
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-accent/60 flex items-center gap-2">
                        <PlayCircle size={16} /> 相關媒體內容
                      </h4>
                      <div className="space-y-4">
                        {selectedEvent.media.map((m, i) => {
                           const isYT = m.url.includes('youtube.com') || m.url.includes('youtu.be');
                           const ytId = isYT ? (m.url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/) || [])[1] : null;

                           return (
                             <div key={i} className="glass rounded-2xl overflow-hidden border border-white/5">
                               <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{m.title}</span>
                                  {isYT ? <Youtube size={14} className="text-red-500" /> : <ExternalLink size={14} />}
                               </div>
                               {ytId ? (
                                 <div className="aspect-video">
                                   <iframe
                                      width="100%"
                                      height="100%"
                                      src={`https://www.youtube.com/embed/${ytId}`}
                                      title={m.title}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                 </div>
                               ) : (
                                 <a href={m.url} target="_blank" rel="noopener" className="p-6 block hover:bg-white/5 transition-colors text-center">
                                   <div className="text-accent font-bold text-xs">前往連結視察內容</div>
                                 </a>
                               )}
                             </div>
                           );
                        })}
                      </div>
                    </div>
                  )}

                  {!selectedEvent.media?.length && (
                    <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-3xl">
                      <p className="text-white/20 text-xs font-bold uppercase tracking-widest italic">此事件目前無關聯媒體</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
