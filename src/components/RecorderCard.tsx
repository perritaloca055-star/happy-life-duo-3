import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Radio,
  Download,
  Share2,
  Trash2,
  Square,
  Play,
  Pause,
  ShieldAlert,
  Sparkles,
  Music,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AudioRecording } from '../types';

export const RecorderCard: React.FC = () => {
  const { recordings, addRecording, deleteRecording, sendMessage } = useApp();

  const [activeRecordingMode, setActiveRecordingMode] = useState<'normal' | 'live_shared'>('normal');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'normal' | 'shared'>('normal');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const wakeLockRef = useRef<unknown>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } }).wakeLock.request('screen');
        setWakeLockActive(true);
      }
    } catch {
      console.warn('WakeLock unavailable');
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      try {
        (wakeLockRef.current as { release: () => Promise<void> }).release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  };

  const handleStartRecording = async (mode: 'normal' | 'live_shared') => {
    try {
      setActiveRecordingMode(mode);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      drawVisualizer();

      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      rec.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const now = new Date();
        const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const prefix = mode === 'live_shared' ? 'AUDIO-COMPARTIDO' : 'AUDIO-NORMAL';
        const fileName = `${prefix}-${ymd}-${timeStr}-${randomCode}.webm`;

        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const dataUrl = reader.result as string;
            addRecording({
              fileName,
              duration: recordDuration,
              dataUrl,
              isShared: mode === 'live_shared',
              category: mode,
            });

            if (mode === 'live_shared') {
              sendMessage(undefined, undefined, dataUrl);
            }
          }
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((t) => t.stop());
        releaseWakeLock();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      rec.start();
      mediaRecorderRef.current = rec;
      setIsRecording(true);
      await requestWakeLock();
    } catch {
      alert('Por favor autoriza el micrófono en tu dispositivo para poder grabar.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyserRef.current?.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = activeRecordingMode === 'live_shared' ? '#f43f5e' : '#84cc16';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    render();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const downloadFile = (dataUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareRecording = async (rec: AudioRecording) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Grabación: ${rec.fileName}`,
          text: `Escucha esta grabación de voz de Happy Life Duo`,
          url: window.location.href,
        });
      } catch {
        // cancelled
      }
    } else {
      downloadFile(rec.dataUrl, rec.fileName);
    }
  };

  // Separa grabaciones según tipo en orden cronológico (más recientes primero)
  const normalRecordings = [...recordings]
    .filter((r) => r.category !== 'live_shared' && !r.isShared)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sharedRecordings = [...recordings]
    .filter((r) => r.category === 'live_shared' || r.isShared)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <section className="w-full space-y-6">
      {/* Header Panel */}
      <div className="glass-card p-6 border-lime-500/30 bg-gradient-to-br from-lime-950/25 via-black/40 to-slate-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-3xl bg-[#556b2f]/30 border-2 border-lime-400/40 flex items-center justify-center text-lime-300 shadow-xl">
              <Mic className={`w-7 h-7 ${isRecording ? 'animate-bounce text-rose-400' : 'animate-pulse'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30 tracking-wider">
                  Wake Lock Integrado ⚡
                </span>
                <span className="text-xs text-white/50">Graba con pantalla apagada</span>
              </div>
              <h3 className="text-xl font-black text-white font-heading mt-0.5">
                Grabadora de Amor & Notas de Voz
              </h3>
              <p className="text-xs text-white/60">
                Guarda notas de voz o transmite audio compartido en directo a tu pareja.
              </p>
            </div>
          </div>

          {wakeLockActive && (
            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Pantalla Activa</span>
            </div>
          )}
        </div>

        {/* Live Visualizer and Recording Controls */}
        <div className="mt-6 p-5 rounded-3xl bg-black/50 border border-white/10 space-y-4 text-center">
          {isRecording ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-widest text-red-400">
                  {activeRecordingMode === 'live_shared' ? 'Transmitiendo Audio Compartido 📡' : 'Grabando Audio Normal 🎙️'}
                </span>
              </div>

              <div className="text-4xl font-black font-mono tracking-widest text-white drop-shadow-lg">
                {formatDuration(recordDuration)}
              </div>

              <div className="w-full flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={50}
                  className="rounded-xl bg-black/60 border border-white/10"
                />
              </div>

              <button
                type="button"
                onClick={handleStopRecording}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm flex items-center gap-2.5 mx-auto cursor-pointer shadow-xl active:scale-95 transition-all"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Detener y Guardar Grabación</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <button
                type="button"
                onClick={() => handleStartRecording('normal')}
                className="p-5 rounded-3xl bg-gradient-to-br from-[#3f6212]/30 via-black/40 to-slate-900 border-2 border-lime-500/40 hover:border-lime-400 text-left cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-lime-500/20 text-lime-300 flex items-center justify-center font-bold">
                    <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-lime-400/20 text-lime-300">
                    Normal
                  </span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-lime-200">
                  Grabar Audio Normal
                </h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Graba notas personales en alta calidad con nombre alfanumérico por fecha y hora.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleStartRecording('live_shared')}
                className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 via-black/40 to-slate-900 border-2 border-rose-500/40 hover:border-rose-400 text-left cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5 group-hover:scale-110 transition-transform animate-pulse" />
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-rose-400/20 text-rose-300">
                    Compartido ❤
                  </span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-rose-200">
                  Audio Compartido en Directo
                </h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Transmite a tu pareja en vivo y se envía automáticamente al Mini Chat de la app.
                </p>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: LISTAS ORGANIZADAS POR TIPO Y EN ORDEN CRONOLÓGICO */}
      <div className="glass-card p-6 space-y-4">
        {/* Selector de Pestañas de Grabaciones */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('normal')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'normal'
                  ? 'bg-lime-500 text-slate-950 shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Grabaciones Normales ({normalRecordings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shared')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'shared'
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Audios Compartidos / Duo ({sharedRecordings.length})</span>
            </button>
          </div>
        </div>

        {/* LISTA 1: GRABACIONES NORMALES */}
        {activeTab === 'normal' && (
          <div className="space-y-3">
            {normalRecordings.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs italic bg-white/5 rounded-3xl">
                Aún no tienes grabaciones normales. ¡Toca "Grabar Audio Normal" para guardar una!
              </div>
            ) : (
              normalRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-3xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-lime-400/40 transition-colors"
                >
                  <div className="overflow-hidden space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-lime-500/20 text-lime-300">
                        Normal
                      </span>
                      <p className="font-bold text-white text-xs truncate max-w-xs">{rec.fileName}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rec.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span>Duración: {formatDuration(rec.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <audio src={rec.dataUrl} controls className="h-8 max-w-[150px] sm:max-w-[180px]" />
                    <button
                      type="button"
                      onClick={() => handleShareRecording(rec)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="Compartir"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(rec.dataUrl, rec.fileName)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="Descargar archivo"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRecording(rec.id)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-red-500 text-white cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* LISTA 2: AUDIOS COMPARTIDOS / DUO */}
        {activeTab === 'shared' && (
          <div className="space-y-3">
            {sharedRecordings.length === 0 ? (
              <div className="p-8 text-center text-rose-200/40 text-xs italic bg-rose-950/20 rounded-3xl border border-rose-500/20">
                Aún no has transmitido audios compartidos con tu pareja.
              </div>
            ) : (
              sharedRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-3xl bg-rose-950/30 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-400 transition-colors"
                >
                  <div className="overflow-hidden space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 flex items-center gap-1">
                        <Radio className="w-3 h-3" /> Compartido Duo
                      </span>
                      <p className="font-bold text-rose-100 text-xs truncate max-w-xs">{rec.fileName}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-rose-200/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rec.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span>Duración: {formatDuration(rec.duration)}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">Sincronizado en Mini Chat 💬</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <audio src={rec.dataUrl} controls className="h-8 max-w-[150px] sm:max-w-[180px]" />
                    <button
                      type="button"
                      onClick={() => handleShareRecording(rec)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="Compartir"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(rec.dataUrl, rec.fileName)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="Descargar archivo"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRecording(rec.id)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-red-500 text-white cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};
