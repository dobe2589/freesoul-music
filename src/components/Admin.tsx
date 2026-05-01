import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, handleFirestoreError, OperationType, getDirectImageUrl } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LOCATIONS, LocationData } from '../constants';
import { Save, LogOut, ChevronLeft, Image as ImageIcon, Music, Type, ExternalLink, X } from 'lucide-react';

const ADMIN_EMAIL = "dobe2589@gmail.com";

const Admin: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);
  
  // Settings
  const [coverBg, setCoverBg] = useState('');
  const [mapBg, setMapBg] = useState('');
  
  // Locations Data (shadowing constants for local editing)
  const [localLocations, setLocalLocations] = useState<LocationData[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u?.email === ADMIN_EMAIL) {
        fetchData();
      }
    });
    return unsub;
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Settings
      const settingsDoc = await getDoc(doc(db, 'config', 'general'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setCoverBg(data.coverBackgroundUrl || '');
        setMapBg(data.mapBackgroundUrl || '');
      }

      // Fetch Locations
      const locsSnap = await getDocs(collection(db, 'locations'));
      if (locsSnap.empty) {
        // Initial bootstrap from constants
        setLocalLocations(LOCATIONS.map(l => ({ ...l })));
      } else {
        const fetched = locsSnap.docs.map(d => d.data() as LocationData);
        
        // Use fetched data as primary
        const remoteIds = new Set(fetched.map(f => f.id));
        const missingFromRemote = LOCATIONS.filter(l => !remoteIds.has(l.id));
        
        setLocalLocations([...fetched, ...missingFromRemote]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'general'), { 
        coverBackgroundUrl: coverBg,
        mapBackgroundUrl: mapBg 
      });
      alert('全域設定儲存成功！');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'config/general');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocation = async (loc: LocationData) => {
    if (!user) return;
    setSaving(true);
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("儲存失敗：未偵測到登入狀態，請重新整理頁面。");
      setSaving(false);
      return;
    }

    // Clean data: remove undefined, and prepare for Firestore
    const cleanData = JSON.parse(JSON.stringify(loc));
    
    // Ensure nested objects exist to avoid crashes
    if (!cleanData.hitArea) cleanData.hitArea = { x: 50, y: 50, w: 10, h: 10 };
    if (!cleanData.character) cleanData.character = { x: 50, y: 50, width: 20, image: "" };
    
    // Ensure all required arrays exist even if empty
    if (!Array.isArray(cleanData.playlists)) cleanData.playlists = [];
    if (!Array.isArray(cleanData.audioPreviews)) cleanData.audioPreviews = [];
    if (!Array.isArray(cleanData.videos)) cleanData.videos = [];
    if (cleanData.underConstruction === undefined) cleanData.underConstruction = false;
    if (cleanData.isArchive === undefined) cleanData.isArchive = false;

    console.log(`Saving document ${loc.id} for user ${currentUser.uid} (${currentUser.email})`);
    console.log('Payload:', cleanData);

    try {
      await setDoc(doc(db, 'locations', loc.id), cleanData);
      setFeedback({ msg: `「${loc.name}」已同步至雲端音樂宇宙！`, type: 'success' });
    } catch (e: any) {
      console.error('Save failed details:', e);
      let msg = e.message || String(e);
      if (msg.includes('permission')) {
        msg = "權限不足 (Permission Denied)。請確保您的帳號已授權。";
      }
      setFeedback({ msg: `儲存失敗！原因：${msg}`, type: 'error' });
      handleFirestoreError(e, OperationType.WRITE, `locations/${loc.id}`);
    } finally {
      setSaving(false);
    }
  };

  const addLocation = () => {
    const newId = `loc-${Date.now()}`;
    const newLoc: LocationData = {
      id: newId,
      name: "新島嶼地點",
      nameEn: "NEW ISLAND",
      characterName: "新守護者",
      characterTitle: "島嶼守護者",
      isArchive: false,
      underConstruction: false,
      hitArea: { x: 50, y: 50, w: 10, h: 10 },
      character: { x: 50, y: 50, width: 20, image: "" },
      coverImage: "",
      sceneImage: "",
      description: "輸入地點介紹...",
      playlists: [],
      audioPreviews: [],
      videos: []
    };
    setLocalLocations([...localLocations, newLoc]);
  };

  const addArchive = () => {
    const newId = `archive-${Date.now()}`;
    const newArchive: LocationData = {
      id: newId,
      name: "新唱片記錄",
      nameEn: "NEW RECORD",
      characterName: "內容標題",
      characterTitle: "歷史回響",
      isArchive: true,
      underConstruction: false,
      hitArea: { x: 0, y: 0, w: 0, h: 0 },
      character: { x: 0, y: 0, width: 0, image: "" },
      coverImage: "",
      sceneImage: "",
      description: "輸入唱片介紹...",
      playlists: [],
      audioPreviews: [],
      videos: []
    };
    setLocalLocations([...localLocations, newArchive]);
  };

  if (loading) return <div className="p-20 text-white font-bold">載入管理權限中...</div>;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
        <div className="max-w-md w-full glass p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-white mb-6">管理員存取限制</h2>
          <p className="text-white/60 mb-8 text-sm">請使用授權帳號登入 ({ADMIN_EMAIL})</p>
          <button 
            onClick={handleLogin}
            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors"
          >
            使用 Google 帳號登入
          </button>
          <button onClick={onClose} className="mt-4 text-white/40 text-xs underline">返回地圖</button>
        </div>
      </div>
    );
  }

  const mapItems = localLocations.filter(l => !l.isArchive);
  const archiveItems = localLocations.filter(l => l.isArchive);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white overflow-y-auto font-sans custom-scrollbar">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
          feedback.type === 'success' ? 'bg-accent text-black' : 'bg-red-500 text-white'
        }`}>
          {feedback.type === 'success' ? <Save size={14} /> : <X size={14} />}
          {feedback.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6 md:p-12 mb-20">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <ChevronLeft />
            </button>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">後台管理系統</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-xs text-white/40 hover:text-white mr-4">
              <LogOut size={14} /> 登出
            </button>
            <button 
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors"
            >
              更新全域背景
            </button>
          </div>
        </header>

        {/* General Settings */}
        <section className="mb-16">
          <div className="glass p-6 rounded-2xl grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-2 font-bold">封面背景 (URL)</label>
              <input type="text" value={coverBg} onChange={e => setCoverBg(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-2 font-bold">地圖背景 (URL)</label>
              <input type="text" value={mapBg} onChange={e => setMapBg(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs outline-none" />
            </div>
          </div>
        </section>

        {/* Section Tabs / Headers */}
        <div className="space-y-24">
          {/* Main Map Section */}
          <section>
            <div className="flex items-center justify-between mb-8 border-l-4 border-accent pl-4">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-widest text-white">主地圖系統</h2>
                <p className="text-accent text-[10px] uppercase font-bold tracking-widest">Main Map Locations</p>
              </div>
              <button 
                onClick={addLocation}
                className="px-6 py-2 bg-accent text-black font-black text-xs tracking-widest uppercase rounded-full hover:scale-105 transition-transform"
              >
                + 新增地點
              </button>
            </div>

            <div className="space-y-8">
              {mapItems.map((loc) => {
                const globalIdx = localLocations.findIndex(l => l.id === loc.id);
                return (
                  <div key={loc.id} className="glass p-8 rounded-3xl border border-white/5 relative group">
                    <button 
                      onClick={() => setLocalLocations(localLocations.filter(l => l.id !== loc.id))}
                      className="absolute top-4 right-4 p-2 text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={16} />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-[10px] text-white/30 uppercase mb-2">地點名稱</label>
                            <input type="text" value={loc.name} onChange={e => {
                              const next = [...localLocations];
                              next[globalIdx].name = e.target.value;
                              setLocalLocations(next);
                            }} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] text-accent/50 uppercase mb-2">英文/副標</label>
                            <input type="text" value={loc.nameEn || ''} onChange={e => {
                              const next = [...localLocations];
                              next[globalIdx].nameEn = e.target.value;
                              setLocalLocations(next);
                            }} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-accent" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/30 uppercase mb-2">人物姓名</label>
                          <input type="text" value={loc.characterName} onChange={e => {
                            const next = [...localLocations];
                            next[globalIdx].characterName = e.target.value;
                            setLocalLocations(next);
                          }} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm" />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/30 uppercase mb-2">人物稱號 (預設: 島嶼守護者)</label>
                          <input type="text" value={loc.characterTitle || ''} onChange={e => {
                            const next = [...localLocations];
                            next[globalIdx].characterTitle = e.target.value;
                            setLocalLocations(next);
                          }} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm" />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/30 uppercase mb-2">介紹文字</label>
                          <textarea rows={4} value={loc.description} onChange={e => {
                            const next = [...localLocations];
                            next[globalIdx].description = e.target.value;
                            setLocalLocations(next);
                          }} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm resize-none h-32" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-white/30 uppercase mb-2">封面地景 URL</label>
                            <input type="text" value={loc.sceneImage || ''} onChange={e => {
                              const next = [...localLocations];
                              next[globalIdx].sceneImage = e.target.value;
                              setLocalLocations(next);
                            }} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] font-mono" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-white/30 uppercase mb-2">角色立繪 URL</label>
                            <input type="text" value={loc.character.image || ''} onChange={e => {
                              const next = [...localLocations];
                              next[globalIdx].character.image = e.target.value;
                              setLocalLocations(next);
                            }} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] font-mono" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                           <h4 className="text-[10px] text-accent font-bold uppercase tracking-widest mb-4">地圖座標設定</h4>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <span className="block text-[9px] text-white/20 uppercase">Hit Area (% x,y,w,h)</span>
                                <div className="grid grid-cols-2 gap-2">
                                  {['x','y','w','h'].map(f => (
                                    <input key={f} type="number" value={(loc.hitArea as any)[f]} onChange={e => {
                                      const next = [...localLocations];
                                      (next[globalIdx].hitArea as any)[f] = Number(e.target.value);
                                      setLocalLocations(next);
                                    }} className="bg-white/5 border border-white/10 rounded p-2 text-xs" placeholder={f} />
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3">
                                <span className="block text-[9px] text-white/20 uppercase">Char Pos (% x,y,width)</span>
                                <div className="grid grid-cols-2 gap-2">
                                  {['x','y','width'].map(f => (
                                    <input key={f} type="number" value={(loc.character as any)[f]} onChange={e => {
                                      const next = [...localLocations];
                                      (next[globalIdx].character as any)[f] = Number(e.target.value);
                                      setLocalLocations(next);
                                    }} className="bg-white/5 border border-white/10 rounded p-2 text-xs" placeholder={f} />
                                  ))}
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={loc.underConstruction} onChange={e => {
                              const next = [...localLocations];
                              next[globalIdx].underConstruction = e.target.checked;
                              setLocalLocations(next);
                            }} className="w-4 h-4 rounded border-white/10 bg-white/5 accent-accent" />
                            <span className="text-xs text-white/40 font-bold uppercase">施工中 (鎖定狀態)</span>
                          </label>
                          <button 
                            disabled={saving}
                            onClick={() => handleSaveLocation(loc)}
                            className="bg-accent px-6 py-2 rounded-xl text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                          >
                            <Save size={14} /> {saving ? 'SAVING...' : 'SAVE DATA'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Archive Records Section */}
          <section>
            <div className="flex items-center justify-between mb-8 border-l-4 border-white pl-4">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-widest text-white">舊音軌存放區</h2>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Old Audio Track Archive</p>
              </div>
              <button 
                onClick={addArchive}
                className="px-6 py-2 bg-white text-black font-black text-xs tracking-widest uppercase rounded-full hover:scale-105 transition-transform"
              >
                + 新增唱片
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {archiveItems.map((loc) => {
                const globalIdx = localLocations.findIndex(l => l.id === loc.id);
                return (
                  <div key={loc.id} className="glass p-6 rounded-3xl border border-white/5 relative group h-full flex flex-col">
                    <button 
                      onClick={() => setLocalLocations(localLocations.filter(l => l.id !== loc.id))}
                      className="absolute top-4 right-4 p-2 text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={16} />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                        {loc.sceneImage ? (
                          <img src={getDirectImageUrl(loc.sceneImage)} className="w-full h-full object-cover opacity-60" />
                        ) : (
                          <Music className="w-6 h-6 text-white/10" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input type="text" value={loc.name} onChange={e => {
                          const next = [...localLocations];
                          next[globalIdx].name = e.target.value;
                          setLocalLocations(next);
                        }} className="w-full bg-transparent border-b border-white/10 text-lg font-bold text-white outline-none mb-1" placeholder="唱片名稱" />
                        <input type="text" value={loc.nameEn || ''} onChange={e => {
                          const next = [...localLocations];
                          next[globalIdx].nameEn = e.target.value;
                          setLocalLocations(next);
                        }} className="w-full bg-transparent text-[10px] text-accent font-black uppercase tracking-widest outline-none" placeholder="副標題" />
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div>
                        <label className="block text-[9px] text-white/20 uppercase mb-1">封面圖片 URL</label>
                        <input type="text" value={loc.sceneImage || ''} onChange={e => {
                          const next = [...localLocations];
                          next[globalIdx].sceneImage = e.target.value;
                          setLocalLocations(next);
                        }} className="w-full bg-white/5 border border-white/10 rounded p-2 text-[9px] font-mono" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/20 uppercase mb-1">內容標題 (字卡大字)</label>
                        <input type="text" value={loc.characterName} onChange={e => {
                          const next = [...localLocations];
                          next[globalIdx].characterName = e.target.value;
                          setLocalLocations(next);
                        }} className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-white/20 uppercase mb-1">回憶描述</label>
                        <textarea value={loc.description} onChange={e => {
                          const next = [...localLocations];
                          next[globalIdx].description = e.target.value;
                          setLocalLocations(next);
                        }} className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs h-24 resize-none" />
                      </div>
                      
                      {/* Media for Archive */}
                      <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-accent font-bold uppercase tracking-widest">媒體內容 (Media)</span>
                          <button 
                            onClick={() => {
                              const next = [...localLocations];
                              next[globalIdx].playlists = [...(next[globalIdx].playlists || []), { label: '', url: '' }];
                              setLocalLocations(next);
                            }}
                            className="text-[8px] text-white/40 hover:text-white"
                          >
                            + 新增連結
                          </button>
                        </div>
                        <div className="space-y-2">
                           {(loc.playlists || []).map((pl, pIdx) => (
                             <div key={pIdx} className="flex gap-2">
                               <input type="text" value={pl.label} onChange={e => {
                                 const next = [...localLocations];
                                 const p = [...(next[globalIdx].playlists || [])];
                                 p[pIdx].label = e.target.value;
                                 next[globalIdx].playlists = p;
                                 setLocalLocations(next);
                               }} className="w-1/3 bg-white/5 border border-white/10 rounded p-2 text-[9px]" placeholder="標題"/>
                               <input type="text" value={pl.url} onChange={e => {
                                 const next = [...localLocations];
                                 const p = [...(next[globalIdx].playlists || [])];
                                 p[pIdx].url = e.target.value;
                                 next[globalIdx].playlists = p;
                                 setLocalLocations(next);
                               }} className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-[9px]" placeholder="URL"/>
                               <button onClick={() => {
                                 const next = [...localLocations];
                                 next[globalIdx].playlists = (next[globalIdx].playlists || []).filter((_, i) => i !== pIdx);
                                 setLocalLocations(next);
                               }} className="text-red-500/50 hover:text-red-500">×</button>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                       <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest italic">Archive System v1.0</span>
                       <button 
                        disabled={saving}
                        onClick={() => handleSaveLocation(loc)}
                        className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors"
                      >
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {archiveItems.length === 0 && (
                <div className="col-span-full py-16 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 text-white/10">
                  <Music size={40} />
                  <p className="text-xs uppercase tracking-widest font-black italic">尚無唱片紀錄</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;
