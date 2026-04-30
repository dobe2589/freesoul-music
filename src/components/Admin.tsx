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

      // Fetch Locations (from DB or fallback to constants if empty)
      const locsSnap = await getDocs(collection(db, 'locations'));
      if (locsSnap.empty) {
        // Initial bootstrap from constants
        setLocalLocations(LOCATIONS.map(l => ({ ...l })));
      } else {
        const fetched = locsSnap.docs.map(d => d.data() as LocationData);
        // Merge with constants to ensure we have all defined locations
        const merged = LOCATIONS.map(base => {
          const remote = fetched.find(f => f.id === base.id);
          return remote ? { ...base, ...remote } : { ...base };
        });
        setLocalLocations(merged);
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
    try {
      await setDoc(doc(db, 'locations', loc.id), loc);
      alert(`${loc.name} 資料儲存成功！`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `locations/${loc.id}`);
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto p-6 md:p-12 mb-20">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <ChevronLeft />
            </button>
            <h1 className="text-3xl font-black tracking-tighter uppercase">後台管理系統</h1>
          </div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-xs text-white/40 hover:text-white">
            <LogOut size={14} /> 登出系統
          </button>
        </header>

        {/* General Visual Settings */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
            <ImageIcon size={18} className="text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-widest">網站視覺設定</h2>
          </div>
          <div className="glass p-6 rounded-xl space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold">封面背景圖片 (Cover Page)</label>
                  <input 
                    type="text" 
                    value={coverBg || ''} 
                    onChange={e => setCoverBg(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/40 outline-none"
                  />
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10">
                   {coverBg ? (
                     <img src={getDirectImageUrl(coverBg)} alt="Cover Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">無預覽</div>
                   )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold">地圖背景圖片 (Map / Floating Island)</label>
                  <input 
                    type="text" 
                    value={mapBg || ''} 
                    onChange={e => setMapBg(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/40 outline-none"
                  />
                  <p className="mt-2 text-[10px] text-white/30">上傳「浮空島」背景圖，支援 Google Drive 連結。</p>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10">
                   {mapBg ? (
                     <img src={getDirectImageUrl(mapBg)} alt="Map Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">無預覽</div>
                   )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button 
                disabled={saving}
                onClick={handleSaveSettings}
                className="px-8 py-4 bg-accent text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white disabled:opacity-50 flex items-center gap-2 text-sm transition-all"
              >
                <Save size={18} /> {saving ? '儲存中...' : '儲存視覺設定'}
              </button>
            </div>
          </div>
        </section>

        {/* Islands Explorer */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
            <Music size={18} className="text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-widest">音樂島嶼資料管理</h2>
          </div>

          <div className="space-y-8">
            {localLocations.map((loc, idx) => (
              <div key={loc.id} className="glass p-6 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-white/5 rounded text-[10px] font-bold text-white/40">{idx + 1}</span>
                    <h3 className="text-xl font-bold tracking-tight">
                      {loc.name} <span className="text-sm font-normal text-white/30 ml-2">({loc.id})</span>
                    </h3>
                  </div>
                  <button 
                    disabled={saving}
                    onClick={() => handleSaveLocation(loc)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    <Save size={16} /> {saving ? '儲存中' : '儲存'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* 主要資訊與介紹 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold">島嶼/地點名稱 (Island Name)</label>
                      <input 
                        type="text" 
                        value={loc.name || ''} 
                        onChange={e => {
                          const next = [...localLocations];
                          next[idx].name = e.target.value;
                          setLocalLocations(next);
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/40 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold">守護者角色名稱 (Character Name)</label>
                      <input 
                        type="text" 
                        value={loc.characterName || ''} 
                        onChange={e => {
                          const next = [...localLocations];
                          next[idx].characterName = e.target.value;
                          setLocalLocations(next);
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/40 outline-none"
                        placeholder="將顯示於封面人物介紹"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold italic">人物設置與介紹 (文字將顯示於封面互動條中)</label>
                      <textarea 
                        rows={6}
                        value={loc.description || ''} 
                        onChange={e => {
                          const next = [...localLocations];
                          next[idx].description = e.target.value;
                          setLocalLocations(next);
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/40 outline-none resize-none leading-relaxed"
                        placeholder="請輸入一段詩意的介紹文本..."
                      />
                    </div>
                  </div>

                  {/* 媒體與狀態 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold italic">多個播放清單 (Youtube/Spotify...)</label>
                      <div className="space-y-2">
                        {(loc.playlists || []).map((pl, pIdx) => (
                          <div key={pIdx} className="flex gap-2">
                            <input 
                              type="text" 
                              value={pl.label} 
                              placeholder="標題"
                              onChange={e => {
                                const next = [...localLocations];
                                const playlists = [...(next[idx].playlists || [])];
                                playlists[pIdx].label = e.target.value;
                                next[idx].playlists = playlists;
                                setLocalLocations(next);
                              }}
                              className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/40 outline-none"
                            />
                            <input 
                              type="text" 
                              value={pl.url} 
                              placeholder="URL"
                              onChange={e => {
                                const next = [...localLocations];
                                const playlists = [...(next[idx].playlists || [])];
                                playlists[pIdx].url = e.target.value;
                                next[idx].playlists = playlists;
                                setLocalLocations(next);
                              }}
                              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/40 outline-none"
                            />
                            <button 
                              onClick={() => {
                                const next = [...localLocations];
                                next[idx].playlists = (next[idx].playlists || []).filter((_, i) => i !== pIdx);
                                setLocalLocations(next);
                              }}
                              className="text-red-500 hover:text-red-400 p-2"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const next = [...localLocations];
                            next[idx].playlists = [...(next[idx].playlists || []), { label: '', url: '' }];
                            setLocalLocations(next);
                          }}
                          className="w-full py-2 bg-white/5 border border-dashed border-white/10 rounded-lg text-white/20 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                          + 新增播放清單
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold italic">試聽音軌 (Direct Audio URL)</label>
                      <div className="space-y-2">
                        {(loc.audioPreviews || []).map((audio, aIdx) => (
                          <div key={aIdx} className="flex gap-2">
                            <input 
                              type="text" 
                              value={audio.title} 
                              placeholder="曲目名稱"
                              onChange={e => {
                                const next = [...localLocations];
                                const list = [...(next[idx].audioPreviews || [])];
                                list[aIdx].title = e.target.value;
                                next[idx].audioPreviews = list;
                                setLocalLocations(next);
                              }}
                              className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/40 outline-none"
                            />
                            <input 
                              type="text" 
                              value={audio.url} 
                              placeholder="Audio URL (.mp3)"
                              onChange={e => {
                                const next = [...localLocations];
                                const list = [...(next[idx].audioPreviews || [])];
                                list[aIdx].url = e.target.value;
                                next[idx].audioPreviews = list;
                                setLocalLocations(next);
                              }}
                              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/40 outline-none"
                            />
                            <button 
                              onClick={() => {
                                const next = [...localLocations];
                                next[idx].audioPreviews = (next[idx].audioPreviews || []).filter((_, i) => i !== aIdx);
                                setLocalLocations(next);
                              }}
                              className="text-red-500 hover:text-red-400 p-2"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const next = [...localLocations];
                            next[idx].audioPreviews = [...(next[idx].audioPreviews || []), { title: '', url: '' }];
                            setLocalLocations(next);
                          }}
                          className="w-full py-2 bg-white/5 border border-dashed border-white/10 rounded-lg text-white/20 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                          + 新增試聽音軌
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold italic">影片撥放 (Youtube URL)</label>
                      <div className="space-y-2">
                        {(loc.videos || []).map((video, vIdx) => (
                          <div key={vIdx} className="flex gap-2">
                            <input 
                              type="text" 
                              value={video.title} 
                              placeholder="影片標題"
                              onChange={e => {
                                const next = [...localLocations];
                                const list = [...(next[idx].videos || [])];
                                list[vIdx].title = e.target.value;
                                next[idx].videos = list;
                                setLocalLocations(next);
                              }}
                              className="w-1/3 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/40 outline-none"
                            />
                            <input 
                              type="text" 
                              value={video.url} 
                              placeholder="Youtube URL"
                              onChange={e => {
                                const next = [...localLocations];
                                const list = [...(next[idx].videos || [])];
                                list[vIdx].url = e.target.value;
                                next[idx].videos = list;
                                setLocalLocations(next);
                              }}
                              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-white/40 outline-none"
                            />
                            <button 
                              onClick={() => {
                                const next = [...localLocations];
                                next[idx].videos = (next[idx].videos || []).filter((_, i) => i !== vIdx);
                                setLocalLocations(next);
                              }}
                              className="text-red-500 hover:text-red-400 p-2"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const next = [...localLocations];
                            next[idx].videos = [...(next[idx].videos || []), { title: '', url: '' }];
                            setLocalLocations(next);
                          }}
                          className="w-full py-2 bg-white/5 border border-dashed border-white/10 rounded-lg text-white/20 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                          + 新增影片
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold italic">(舊版) YouTube 播放清單網址</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={loc.playlist || ''} 
                          onChange={e => {
                            const next = [...localLocations];
                            next[idx].playlist = e.target.value;
                            setLocalLocations(next);
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/40 outline-none pr-10"
                        />
                        <a href={loc.playlist} target="_blank" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold">地圖地標照片網址 (Map Character)</label>
                      <input 
                        type="text" 
                        value={loc.character.image || ''} 
                        onChange={e => {
                          const next = [...localLocations];
                          next[idx].character.image = e.target.value;
                          setLocalLocations(next);
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/40 outline-none font-mono"
                        placeholder="https://... 或本地路徑"
                      />
                      <p className="mt-1 text-[9px] text-white/20">顯示於地圖上的人物圖標。</p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/20 mb-2 font-bold">封面長條圖照片網址 (Cover Strip)</label>
                      <input 
                        type="text" 
                        value={loc.coverImage || ''} 
                        onChange={e => {
                          const next = [...localLocations];
                          next[idx].coverImage = e.target.value;
                          setLocalLocations(next);
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-white/40 outline-none font-mono"
                        placeholder="https://... 或本地路徑"
                      />
                      <p className="mt-1 text-[9px] text-white/20">顯示於封面長條互動區。</p>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <span className="block text-[9px] text-white/20 uppercase font-bold tracking-widest">地圖預覽</span>
                        <div className="w-full h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1">
                          {loc.character.image ? (
                            <img src={getDirectImageUrl(loc.character.image)} alt="Map Preview" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="text-[8px] text-white/10">NO IMAGE</div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <span className="block text-[9px] text-white/20 uppercase font-bold tracking-widest">封面預覽</span>
                        <div className="w-full h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1">
                          {loc.coverImage ? (
                            <img src={getDirectImageUrl(loc.coverImage)} alt="Cover Preview" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="text-[8px] text-white/10">NO IMAGE</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-2 pt-2">
                         <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={loc.underConstruction || false} 
                              onChange={e => {
                                const next = [...localLocations];
                                next[idx].underConstruction = e.target.checked;
                                setLocalLocations(next);
                              }}
                              className="w-4 h-4 rounded border-white/10 bg-black/40 accent-accent"
                              id={`check-${loc.id}`}
                            />
                            <label htmlFor={`check-${loc.id}`} className="text-xs font-bold text-white/60">尚未開放 (施工中)</label>
                         </div>
                         <p className="text-[9px] text-white/20 leading-tight">施工中地點將在地圖與封面顯示為鎖定狀態。</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

export default Admin;
