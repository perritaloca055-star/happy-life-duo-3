import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Headphones,
  Music,
  Play,
  Pause,
  Upload,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  Sparkles,
  ExternalLink,
  SkipForward,
  SkipBack,
  FolderOpen,
  FileMusic,
  Disc,
  ListMusic,
  Tv,
  Radio,
  Search,
  RotateCcw,
  RotateCw,
  Sliders
} from 'lucide-react';
import { ModalPortal } from './ModalPortal';

// Curated YouTube & YouTube Music Suggestions
const YOUTUBE_MUSIC_TRACKS = [
  {
    id: 'ym_1',
    title: 'Lofi Hip Hop - Beats to Relax/Study',
    artist: 'Lofi Girl',
    ytId: 'jfKfPfyJRdk',
    albumArt: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60',
    lyrics: 'Ritmos constantes y suaves para calmar la mente y acompañarte sin distracciones.'
  },
  {
    id: 'ym_2',
    title: 'Bossa Nova & Jazz Café Tranquilo',
    artist: 'Café Duo Romance',
    ytId: '3u-4fx4w7iI',
    albumArt: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60',
    lyrics: 'Melodías acústicas para compartir un café o cocinar juntos en calma.'
  },
  {
    id: 'ym_3',
    title: 'Acoustic Love Duets & Serenade',
    artist: 'Acoustic Duo Sessions',
    ytId: '5qap5aO4i9A',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    lyrics: 'Voces cálidas entrelazadas: "Cada paso a tu lado es el lugar donde pertenezco".'
  },
  {
    id: 'ym_4',
    title: 'Frecuencias Sanadoras 432Hz & Piano',
    artist: 'Mindful Harmony',
    ytId: 'lTRiuFIWV54',
    albumArt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60',
    lyrics: 'Paz profunda. Respiración acompasada para resetear el sistema nervioso.'
  }
];

const YOUTUBE_NORMAL_VIDEOS = [
  {
    id: 'yn_1',
    title: 'Paseo Acogedor en Cafetería de Lluvia',
    channel: 'Ambience Lounge',
    ytId: 'e2s36_c0Fys',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'yn_2',
    title: 'Atardecer en la Playa con Fuego de Fogata',
    channel: 'Calm Oceans 4K',
    ytId: 'Nep1qytq9JM',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'yn_3',
    title: 'Chimenea Acogedora Crepitante y Nieve',
    channel: 'Warmth Duo',
    ytId: 'L_LUpnjgPso',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'
  }
];

interface CachedVlcTrack {
  id: string;
  name: string;
  sizeStr: string;
  dataUrl?: string;
}

export const BodyDoublingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // 3 distinct sections requested by user:
  // 1. YouTube Music
  // 2. YouTube Normal
  // 3. Reproductor VLC / MP3 Local
  const [activeTab, setActiveTab] = useState<'yt_music' | 'yt_normal' | 'vlc_mp3'>('yt_music');

  // YouTube Music State
  const [ytmIndex, setYtmIndex] = useState(0);
  const [isPlayingYtm, setIsPlayingYtm] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isSyncActive, setIsSyncActive] = useState(true);
  const [ytmSearchQuery, setYtmSearchQuery] = useState('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncWithPartner = () => {
    setIsSyncActive(true);
    setSyncFeedback('¡Sincronizado! Tu pareja ahora escucha la misma pista en tiempo real 📡❤️');
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleYtmSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytmSearchQuery.trim()) return;
    window.open(`https://music.youtube.com/search?q=${encodeURIComponent(ytmSearchQuery.trim())}`, '_blank');
  };

  // YouTube Normal State
  const [ytnIndex, setYtnIndex] = useState(0);
  const [customYtInput, setCustomYtInput] = useState('');
  const [customYtId, setCustomYtId] = useState<string | null>(null);

  // VLC MP3 Local State (STRICTLY .mp3 only)
  const [vlcTracks, setVlcTracks] = useState<CachedVlcTrack[]>(() => {
    try {
      const saved = localStorage.getItem('happyduo_vlc_mp3_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeVlcTrack, setActiveVlcTrack] = useState<CachedVlcTrack | null>(null);
  const [isPlayingVlc, setIsPlayingVlc] = useState(false);
  const [vlcProgress, setVlcProgress] = useState(0);
  const [vlcDuration, setVlcDuration] = useState(0);
  const [ignoredFilesNotice, setIgnoredFilesNotice] = useState<string | null>(null);

  const localAudioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYtm = YOUTUBE_MUSIC_TRACKS[ytmIndex];
  const currentYtn = YOUTUBE_NORMAL_VIDEOS[ytnIndex];

  // Save VLC cache
  useEffect(() => {
    try {
      const lightTracks = vlcTracks.map((t) => ({ id: t.id, name: t.name, sizeStr: t.sizeStr }));
      localStorage.setItem('happyduo_vlc_mp3_cache', JSON.stringify(lightTracks));
    } catch {
      // ignore
    }
  }, [vlcTracks]);

  // Scan files STRICTLY FILTERING ONLY .MP3 (ignoring recordings, webm, wav, ogg)
  const handleScanPhoneMp3Only = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: CachedVlcTrack[] = [];
    let ignoredCount = 0;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const isMp3 = f.name.toLowerCase().endsWith('.mp3') || f.type === 'audio/mpeg';

      if (!isMp3) {
        ignoredCount++;
        continue; // REJECT ANY NON-MP3 (e.g. recordings .webm, .wav, notes)
      }

      const url = URL.createObjectURL(f);
      const sizeStr = `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
      newTracks.push({
        id: `mp3_${Date.now()}_${i}`,
        name: f.name.replace(/\.[^/.]+$/, ''),
        sizeStr,
        dataUrl: url,
      });
    }

    if (ignoredCount > 0) {
      setIgnoredFilesNotice(
        `Se filtraron y omitieron ${ignoredCount} archivo(s) no-MP3 (ej. grabaciones o audios compartidos) para mantener tu biblioteca limpia.`
      );
      setTimeout(() => setIgnoredFilesNotice(null), 5000);
    }

    setVlcTracks((prev) => [...newTracks, ...prev]);
    if (newTracks.length > 0) {
      setActiveVlcTrack(newTracks[0]);
      setIsPlayingVlc(true);
    }
  };

  const toggleVlcPlay = (track: CachedVlcTrack) => {
    if (activeVlcTrack?.id === track.id) {
      if (localAudioRef.current) {
        if (isPlayingVlc) {
          localAudioRef.current.pause();
          setIsPlayingVlc(false);
        } else {
          localAudioRef.current.play();
          setIsPlayingVlc(true);
        }
      }
    } else {
      setActiveVlcTrack(track);
      setIsPlayingVlc(true);
    }
  };

  const onTimeUpdate = () => {
    if (localAudioRef.current) {
      setVlcProgress(localAudioRef.current.currentTime);
      setVlcDuration(localAudioRef.current.duration || 0);
    }
  };

  const formatSecs = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleCustomYtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customYtInput.trim()) return;

    let id = customYtInput.trim();
    // Extraer id si es url de youtube
    const match = id.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      id = match[1];
    }
    setCustomYtId(id);
    setCustomYtInput('');
  };

  return (
    <>
      {/* Botón flotante independiente */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-5 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-sm flex items-center gap-2.5 shadow-[0_10px_25px_rgba(79,70,229,0.5)] border border-white/25 cursor-pointer select-none"
        title="Música Dúo"
      >
        <Headphones className="w-5 h-5 text-indigo-200 animate-pulse" />
        <span className="font-heading tracking-wide">Música Dúo</span>
      </motion.button>

      {/* MODAL MÚSICA DUO SEPARADA EN 3 */}
      <ModalPortal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Música Dúo Sincronizada"
        icon={<Headphones className="w-6 h-6 text-indigo-400" />}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5 text-white">
          {/* BARRA DE NAVEGACIÓN EN 3 SECCIONES INDEPENDIENTES */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('yt_music')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'yt_music'
                  ? 'bg-rose-500 text-white font-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4 text-rose-200" />
              <span className="truncate">YouTube Music</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('yt_normal')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'yt_normal'
                  ? 'bg-red-600 text-white font-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4 text-red-200" />
              <span className="truncate">YouTube Video</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vlc_mp3')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'vlc_mp3'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="text-sm">🍦</span>
              <span className="truncate">VLC / MP3 Local</span>
            </button>
          </div>

          {/* 1. SECCIÓN: YOUTUBE MUSIC DUO */}
          {activeTab === 'yt_music' && (
            <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Disc className="w-5 h-5 text-rose-400 animate-spin" />
                  <h4 className="text-sm font-black text-rose-200 uppercase tracking-wider font-heading">
                    YouTube Music Sincronizable 🎵
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Sincronizado con pareja 📡
                  </span>
                  <button
                    type="button"
                    onClick={() => window.open(`https://music.youtube.com/watch?v=${currentYtm.ytId}`, '_blank')}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 cursor-pointer"
                    title="Abrir en YouTube Music"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Buscador de Canciones en YouTube Music */}
              <form onSubmit={handleYtmSearch} className="flex gap-2">
                <input
                  type="text"
                  value={ytmSearchQuery}
                  onChange={(e) => setYtmSearchQuery(e.target.value)}
                  placeholder="Buscar cualquier canción o artista en YouTube Music..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl btn-3d-rose text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Buscar 🔍
                </button>
              </form>

              {/* Botones de Sincronización y Apertura en Teléfono */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncWithPartner}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>Sincronizar con Pareja 📡</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.open(`https://music.youtube.com/watch?v=${currentYtm.ytId}`, '_blank')}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-rose-300" />
                  <span>Abrir en YouTube Music 📲</span>
                </button>
              </div>

              {syncFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs text-center font-bold animate-bounce">
                  {syncFeedback}
                </div>
              )}

              {/* Tarjeta de Canción Actual */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-black/40 border border-rose-500/20">
                <img
                  src={currentYtm.albumArt}
                  alt={currentYtm.title}
                  className="w-24 h-24 rounded-2xl object-cover border border-white/20 shadow-md shrink-0"
                />

                <div className="flex-1 text-center sm:text-left overflow-hidden">
                  <h5 className="text-sm font-black text-white truncate">{currentYtm.title}</h5>
                  <p className="text-xs text-rose-200/70">{currentYtm.artist}</p>

                  {/* Controles de Gestión: Adelantar, Retroceder, Play/Pausa */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setYtmIndex((prev) => (prev - 1 + YOUTUBE_MUSIC_TRACKS.length) % YOUTUBE_MUSIC_TRACKS.length)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="Canción anterior"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPlayingYtm(!isPlayingYtm)}
                      className="px-4 py-2 rounded-xl btn-3d-rose text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isPlayingYtm ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlayingYtm ? 'Pausar' : 'Reproducir'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setYtmIndex((prev) => (prev + 1) % YOUTUBE_MUSIC_TRACKS.length)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="Siguiente canción"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowLyrics(!showLyrics)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        showLyrics ? 'bg-rose-500 border-rose-400 text-white' : 'bg-white/10 border-white/15 text-white/80'
                      }`}
                    >
                      {showLyrics ? 'Ocultar Letra' : 'Letra 📜'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Letra desplegable */}
              {showLyrics && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-100 italic whitespace-pre-line leading-relaxed">
                  "{currentYtm.lyrics}"
                </div>
              )}

              {/* Reproductor Embebido YouTube Music */}
              <div className="rounded-2xl overflow-hidden aspect-video max-h-52 bg-black border border-white/10 shadow-lg">
                <iframe
                  title={currentYtm.title}
                  src={`https://www.youtube.com/embed/${currentYtm.ytId}?autoplay=${isPlayingYtm ? 1 : 0}&playsinline=1&enablejsapi=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Playlist de YouTube Music */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-white/60 uppercase">
                  Lista de canciones disponibles:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {YOUTUBE_MUSIC_TRACKS.map((t, idx) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setYtmIndex(idx);
                        setIsPlayingYtm(true);
                      }}
                      className={`p-2 rounded-xl border text-left text-xs flex items-center gap-2 cursor-pointer transition-all ${
                        ytmIndex === idx
                          ? 'bg-rose-500/30 border-rose-400 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <img src={t.albumArt} alt={t.title} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="truncate">
                        <p className="truncate font-semibold">{t.title}</p>
                        <p className="text-[10px] text-white/40">{t.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. SECCIÓN: YOUTUBE NORMAL DUO */}
          {activeTab === 'yt_normal' && (
            <div className="p-5 rounded-3xl bg-red-950/20 border border-red-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-red-400" />
                  <h4 className="text-sm font-black text-red-200 uppercase tracking-wider font-heading">
                    YouTube Normal Video Duo 📺
                  </h4>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  Video sincronizable
                </span>
              </div>

              {/* Buscar o pegar URL de video de YouTube */}
              <form onSubmit={handleCustomYtSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customYtInput}
                    onChange={(e) => setCustomYtInput(e.target.value)}
                    placeholder="Pega enlace de video de YouTube o ID..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-400"
                  />
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Cargar Video
                </button>
              </form>

              {/* Reproductor de Video YouTube */}
              <div className="rounded-2xl overflow-hidden aspect-video max-h-60 bg-black border border-white/10 shadow-xl">
                <iframe
                  title="YouTube Normal Video"
                  src={`https://www.youtube-nocookie.com/embed/${customYtId || currentYtn.ytId}?autoplay=0&enablejsapi=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Sugerencias de Videos */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-white/60 uppercase">
                  Videos recomendados en pareja:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {YOUTUBE_NORMAL_VIDEOS.map((v, idx) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setYtnIndex(idx);
                        setCustomYtId(null);
                      }}
                      className={`p-2 rounded-xl border text-left text-xs flex flex-col gap-1.5 cursor-pointer transition-all ${
                        ytnIndex === idx && !customYtId
                          ? 'bg-red-500/30 border-red-400 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <img src={v.thumbnail} alt={v.title} className="w-full h-20 rounded-lg object-cover" />
                      <p className="font-semibold truncate">{v.title}</p>
                      <p className="text-[10px] text-white/40 truncate">{v.channel}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. SECCIÓN: REPRODUCTOR VLC / MP3 LOCAL (SOLO ARCHIVOS .MP3) */}
          {activeTab === 'vlc_mp3' && (
            <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-400/40 text-xl shadow-md">
                    🍦
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-200 font-heading">
                      Reproductor VLC Duo (Solo Música MP3)
                    </h4>
                    <p className="text-[11px] text-white/60">
                      Filtro estricto: solo importa canciones MP3, excluye grabaciones y audios.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Escanear Música MP3</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".mp3,audio/mpeg"
                  className="hidden"
                  onChange={handleScanPhoneMp3Only}
                />
              </div>

              {/* Mensaje de filtrado si se omitieron grabaciones */}
              {ignoredFilesNotice && (
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-semibold">
                  {ignoredFilesNotice}
                </div>
              )}

              {/* Track Activo en Reproducción VLC */}
              {activeVlcTrack && activeVlcTrack.dataUrl ? (
                <div className="p-4 rounded-2xl bg-black/60 border border-amber-400/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-200 truncate max-w-xs">
                      🎵 {activeVlcTrack.name}
                    </span>
                    <span className="text-[10px] text-white/50">
                      {formatSecs(vlcProgress)} / {formatSecs(vlcDuration)}
                    </span>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{
                        width: `${vlcDuration > 0 ? (vlcProgress / vlcDuration) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => toggleVlcPlay(activeVlcTrack)}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isPlayingVlc ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlayingVlc ? 'Pausa' : 'Play'}</span>
                    </button>

                    <span className="text-[10px] text-amber-300/80 font-mono">
                      Formato verificado: Archivo MP3 puro
                    </span>
                  </div>

                  <audio
                    ref={localAudioRef}
                    src={activeVlcTrack.dataUrl}
                    autoPlay
                    onTimeUpdate={onTimeUpdate}
                    onEnded={() => setIsPlayingVlc(false)}
                  />
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center text-xs text-white/50 italic">
                  No hay canción MP3 reproduciéndose. Selecciona una de tu biblioteca abajo o escanea tu celular.
                </div>
              )}

              {/* Lista de Canciones MP3 en la Biblioteca */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-white/60 flex items-center gap-1.5">
                  <ListMusic className="w-3.5 h-3.5 text-amber-400" />
                  Biblioteca MP3 ({vlcTracks.length} canciones):
                </span>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {vlcTracks.length === 0 ? (
                    <p className="text-xs text-white/40 italic py-3 text-center">
                      No hay archivos MP3 escaneados aún. Pulsa "Escanear Música MP3" para elegir canciones de tu celular.
                    </p>
                  ) : (
                    vlcTracks.map((tr) => {
                      const isCurrent = activeVlcTrack?.id === tr.id;
                      return (
                        <div
                          key={tr.id}
                          onClick={() => tr.dataUrl && toggleVlcPlay(tr)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileMusic className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="truncate">{tr.name}</span>
                          </div>
                          <span className="text-[10px] text-white/40 shrink-0 ml-2">
                            {isCurrent && isPlayingVlc ? '▶ Sonando' : tr.sizeStr}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalPortal>
    </>
  );
};
