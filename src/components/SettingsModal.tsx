import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Palette,
  Smartphone,
  Shield,
  Bell,
  Share2,
  Lock,
  Download,
  Upload,
  Image as ImageIcon,
  Check,
  LogOut,
  Flower2,
  FileCheck,
  HardDrive,
  Mic,
  Camera,
  MapPin,
  Zap,
  Volume2,
  Sliders,
  Maximize,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModalPortal } from './ModalPortal';

// 20 Exact Full-Screen Uniform Backgrounds (NO half-screen darkness, 100% full immersion)
export const BACKGROUND_PRESETS = [
  { name: 'Celeste', value: 'bg-[#0284c7]', color: '#38bdf8' },
  { name: 'Rosa pastel', value: 'bg-[#db2777]', color: '#f472b6' },
  { name: 'Amarillo pastel', value: 'bg-[#d97706]', color: '#fde047' },
  { name: 'Verde oliva', value: 'bg-[#556b2f]', color: '#556b2f' },
  { name: 'Verde neon', value: 'bg-[#059669]', color: '#10b981' },
  { name: 'Azul eléctrico', value: 'bg-[#2563eb]', color: '#2563eb' },
  { name: 'Vino', value: 'bg-[#881337]', color: '#722f37' },
  { name: 'Burdeo', value: 'bg-[#581c87]', color: '#5e0d1b' },
  { name: 'Negro carbón', value: 'bg-[#18181b]', color: '#1a1f2c' },
  { name: 'Rojo Pasión', value: 'bg-[#dc2626]', color: '#e11d48' },
  { name: 'Negro Puro', value: 'bg-[#000000]', color: '#000000' },
  { name: 'Blanco Suave', value: 'bg-[#f1f5f9]', color: '#ffffff' },
  { name: 'Gris Muy Suave', value: 'bg-[#475569]', color: '#64748b' },
  { name: 'Índigo Profundo', value: 'bg-[#3730a3]', color: '#4338ca' },
  { name: 'Pizarra Carbón', value: 'bg-[#1e293b]', color: '#334155' },
  { name: 'Medianoche', value: 'bg-[#0b0f19]', color: '#020617' },
  { name: 'Verde Salvia', value: 'bg-[#2d4a34]', color: '#4d6150' },
  { name: 'Melocotón Cálido', value: 'bg-[#c2410c]', color: '#ea580c' },
  { name: 'Lavanda Suave', value: 'bg-[#7e22ce]', color: '#a855f7' },
  { name: 'Aurora Dinámica', value: 'mesh-aurora-dark', color: '#ec4899' },
];

export const TEXT_COLORS = [
  { name: 'Blanco Puro', value: '#ffffff' },
  { name: 'Oro Cálido 🌟', value: '#facc15' },
  { name: 'Menta Fresca 🌿', value: '#34d399' },
  { name: 'Azul Eléctrico ⚡', value: '#38bdf8' },
  { name: 'Rosa Pastel 🌸', value: '#f472b6' },
  { name: 'Rosa Fucsia 💖', value: '#ec4899' },
  { name: 'Azul Zafiro 🌊', value: '#60a5fa' },
  { name: 'Lavanda Cósmica 🔮', value: '#c084fc' },
  { name: 'Amarillo Sol ☀️', value: '#fef08a' },
  { name: 'Naranja Atardecer 🍊', value: '#fb923c' },
  { name: 'Rojo Pasión ❤️', value: '#f87171' },
  { name: 'Vino Profundo 🍷', value: '#fda4af' },
  { name: 'Turquesa Neón 💎', value: '#2dd4bf' },
  { name: 'Plata Perlada 🪙', value: '#e2e8f0' },
  { name: 'Esmeralda Vital 🍀', value: '#10b981' },
];

export const SUBTEXT_COLORS = [
  { name: 'Gris Suave', value: '#cbd5e1' },
  { name: 'Azul Claro', value: '#93c5fd' },
  { name: 'Amarillo Pálido', value: '#fef3c7' },
  { name: 'Negro Carbón', value: '#0f172a' },
  { name: 'Rojo Pastel', value: '#fca5a5' },
  { name: 'Verde Menta', value: '#86efac' },
  { name: 'Cian Claro', value: '#a5f3fc' },
  { name: 'Lavanda Suave', value: '#e9d5ff' },
  { name: 'Dorado Tenue', value: '#fde68a' },
  { name: 'Blanco Hielo', value: '#e2e8f0' },
];

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    updateSettings,
    firebaseUser,
    handleGoogleLogin,
    handleLogout,
    exportEncryptedBackup,
    restoreFromEncryptedBackup,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appearance' | 'system' | 'security'>('appearance');
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  // Android Permissions live state
  const [permissionsState, setPermissionsState] = useState<{
    notifications: string;
    mic: string;
    camera: string;
    geo: string;
    wakeLock: boolean;
  }>({
    notifications: 'default',
    mic: 'prompt',
    camera: 'prompt',
    geo: 'prompt',
    wakeLock: 'wakeLock' in navigator,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupRestoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionsState((prev) => ({ ...prev, notifications: Notification.permission }));
    }
  }, []);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          updateSettings({ customBgImage: ev.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const success = restoreFromEncryptedBackup(ev.target.result as string);
          if (success) {
            setRestoreStatus('¡Copia de seguridad restaurada con éxito!');
            setTimeout(() => setRestoreStatus(null), 4000);
          } else {
            setRestoreStatus('Error: El archivo de copia de seguridad no es válido.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRequestPushNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermissionsState((prev) => ({ ...prev, notifications: perm }));
      if (perm === 'granted') {
        new Notification('Happy Life Duo 💘', {
          body: '¡Notificaciones push activadas correctamente!',
          icon: '/icon.svg',
        });
      }
    }
  };

  const handleRequestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionsState((prev) => ({ ...prev, mic: 'granted' }));
      stream.getTracks().forEach((t) => t.stop());
      alert('¡Permiso de micrófono concedido!');
    } catch {
      setPermissionsState((prev) => ({ ...prev, mic: 'denied' }));
      alert('Permiso de micrófono denegado en el navegador.');
    }
  };

  const handleRequestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionsState((prev) => ({ ...prev, camera: 'granted' }));
      stream.getTracks().forEach((t) => t.stop());
      alert('¡Permiso de cámara concedido!');
    } catch {
      setPermissionsState((prev) => ({ ...prev, camera: 'denied' }));
      alert('Permiso de cámara denegado en el navegador.');
    }
  };

  const handleRequestGeoPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionsState((prev) => ({ ...prev, geo: 'granted' }));
          alert('¡Permiso de ubicación GPS concedido!');
        },
        () => {
          setPermissionsState((prev) => ({ ...prev, geo: 'denied' }));
          alert('Permiso de ubicación no concedido.');
        }
      );
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Happy Life Duo',
          text: 'Descarga nuestra app de pareja "Happy Life Duo - Nuestro Lugar Seguro"',
          url: window.location.href,
        });
      } catch {
        // cancelled
      }
    }
  };

  return (
    <ModalPortal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajustes y Personalización"
      icon={<Settings className="w-6 h-6 text-white" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-white">
        {/* Navigation Tabs */}
        <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'appearance' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4 text-rose-400" />
            <span>Colores y Fondos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'system' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Pantalla y Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'security' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Copia y Respaldo</span>
          </button>
        </div>

        {/* TAB 1: APPEARANCE (20 Fondos Uniformes Pantalla Completa + 15 Colores Texto) */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white/90 uppercase tracking-wider">
                  Fondos Uniformes Pantalla Completa (20 Opciones):
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Subir foto</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomBgUpload}
                />
              </div>

              <p className="text-[11px] text-white/50 mb-2">
                Los fondos aplican al 100% de la pantalla sin divisiones oscuras.
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1">
                {BACKGROUND_PRESETS.map((bg) => (
                  <button
                    key={bg.name}
                    type="button"
                    onClick={() => {
                      updateSettings({ backgroundTheme: bg.value, customBgImage: undefined });
                    }}
                    className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      settings.backgroundTheme === bg.value && !settings.customBgImage
                        ? 'border-white ring-2 ring-rose-400 scale-105 shadow-lg'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full shadow-md border border-white/30"
                      style={{ backgroundColor: bg.color }}
                    />
                    <span className="text-[10px] font-bold text-white truncate max-w-full">
                      {bg.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Texto Principal */}
            <div>
              <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2">
                Color de Texto Principal (15 Opciones):
              </label>
              <div className="flex flex-wrap gap-2">
                {TEXT_COLORS.map((tc) => (
                  <button
                    key={tc.name}
                    type="button"
                    onClick={() => updateSettings({ textColor: tc.value })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      settings.textColor === tc.value
                        ? 'border-white ring-2 ring-white/50 scale-105 shadow-md'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: tc.value }} />
                    <span style={{ color: tc.value }}>{tc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtexto */}
            <div>
              <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2">
                Color de Subtexto (10 Opciones):
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBTEXT_COLORS.map((sc) => (
                  <button
                    key={sc.name}
                    type="button"
                    onClick={() => updateSettings({ subtextColor: sc.value })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      settings.subtextColor === sc.value
                        ? 'border-white ring-2 ring-white/50 scale-105 shadow-md'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: sc.value }} />
                    <span style={{ color: sc.value }}>{sc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tamaño Tipografía */}
            <div>
              <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2">
                Tamaño de Tipografía:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'large', 'extralarge'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateSettings({ fontSize: sz })}
                    className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      settings.fontSize === sz ? 'bg-white/20 border-white shadow-sm' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {sz === 'normal' && 'Normal'}
                    {sz === 'large' && 'Grande 👓'}
                    {sz === 'extralarge' && 'Extra Grande 🔍'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM & ANDROID PERMISSIONS & SCREEN RESOLUTION */}
        {activeTab === 'system' && (
          <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin">
            {/* OPTIMIZACIÓN DE RESOLUCIÓN PARA ANDROID */}
            <div className="p-4 rounded-3xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-300" />
                  <h4 className="text-sm font-black text-cyan-100 uppercase tracking-wider font-heading">
                    Optimización de Pantalla según Resolución Android
                  </h4>
                </div>
                <span className="text-[10px] text-cyan-300/80 font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                  Android & Web
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Ajusta la interfaz a la resolución y tamaño de tu teléfono para una lectura cómoda con un solo dedo:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'auto', label: 'Auto 📱', desc: 'Detección móvil' },
                  { id: 'compact', label: '720p HD 🔍', desc: 'Escala 90%' },
                  { id: 'standard', label: '1080p FHD 💻', desc: 'Escala 100%' },
                  { id: 'qhd', label: '1440p 2K 🖥️', desc: 'Escala 105%' },
                  { id: 'fullscreen', label: 'Inmersivo 🚀', desc: 'Sin marcos' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSettings({ screenFit: opt.id as any })}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      settings.screenFit === opt.id
                        ? 'bg-cyan-500/30 border-cyan-400 text-white font-bold shadow-md ring-2 ring-cyan-400/50 scale-[1.02]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Botón para Ocultar Botones de Navegación de Android en Pantalla Completa */}
              <div className="pt-2 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Maximize className="w-4 h-4 text-cyan-400" />
                    <span>Ocultar Barra de Navegación Android</span>
                  </p>
                  <p className="text-[10px] text-white/60">
                    Oculta los botones de retroceder, ir a inicio y apps recientes para pantalla 100% inmersiva.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen?.().catch(() => {});
                      updateSettings({ screenFit: 'fullscreen' });
                    } else {
                      document.exitFullscreen?.().catch(() => {});
                      updateSettings({ screenFit: 'standard' });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black cursor-pointer shadow-md transition-all shrink-0 active:scale-95"
                >
                  {typeof document !== 'undefined' && document.fullscreenElement
                    ? 'Salir de Pantalla Completa'
                    : 'Activar Modo Inmersivo Total 📱'}
                </button>
              </div>
            </div>

            {/* GESTOR AVANZADO DE PERMISOS DE LA APP PARA ANDROID */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-heading flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Gestor de Permisos Android</span>
                </h4>
                <span className="text-[10px] text-white/50">Control de Hardware</span>
              </div>
              <p className="text-xs text-white/70">
                Verifica y autoriza los permisos necesarios para que todas las funciones de audio, mapa y cámara respondan al instante:
              </p>

              <div className="space-y-2">
                {/* Permiso 1: Notificaciones Push */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-amber-300" />
                    <div>
                      <span className="font-bold text-white block">Notificaciones Push</span>
                      <span className="text-[10px] text-white/50">Avisos de alarmas y recordatorios</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestPushNotifications}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold cursor-pointer"
                  >
                    {permissionsState.notifications === 'granted' ? '✅ Concedido' : 'Solicitar'}
                  </button>
                </div>

                {/* Permiso 2: Micrófono */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-lime-400" />
                    <div>
                      <span className="font-bold text-white block">Micrófono</span>
                      <span className="text-[10px] text-white/50">Grabadora de amor y audio compartido</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestMicPermission}
                    className="px-3 py-1.5 rounded-xl bg-lime-500/20 hover:bg-lime-500/30 text-lime-200 font-bold cursor-pointer"
                  >
                    {permissionsState.mic === 'granted' ? '✅ Concedido' : 'Verificar'}
                  </button>
                </div>

                {/* Permiso 3: Cámara */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="font-bold text-white block">Cámara</span>
                      <span className="text-[10px] text-white/50">Fotos rápidas para el Diario de Vida</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestCameraPermission}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-bold cursor-pointer"
                  >
                    {permissionsState.camera === 'granted' ? '✅ Concedido' : 'Verificar'}
                  </button>
                </div>

                {/* Permiso 4: Geolocalización GPS */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white block">Ubicación GPS</span>
                      <span className="text-[10px] text-white/50">Envío de 'Estoy aquí' y enlace Maps/Waze</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestGeoPermission}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold cursor-pointer"
                  >
                    {permissionsState.geo === 'granted' ? '✅ Concedido' : 'Verificar'}
                  </button>
                </div>

                {/* Permiso 5: Wake Lock */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block">Wake Lock de Pantalla</span>
                      <span className="text-[10px] text-white/50">Mantiene la pantalla encendida al grabar</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cyan-300">
                    {permissionsState.wakeLock ? '✅ Soportado' : 'No disponible'}
                  </span>
                </div>
              </div>
            </div>

            {/* MODO BAJO ESTÍMULO Y CALENDARIO MENSTRUAL */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Modo Bajo Estímulo Sensorial 🧘</h4>
                <p className="text-xs text-white/60">
                  Desactiva animaciones y reduce contrastes para aliviar la sobrecarga sensorial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ lowStimulusMode: !settings.lowStimulusMode })}
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  settings.lowStimulusMode ? 'bg-emerald-500 justify-end' : 'bg-white/20 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="p-4 rounded-3xl bg-pink-950/30 border border-pink-500/30 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-pink-200 flex items-center gap-1.5">
                  <Flower2 className="w-4 h-4 text-pink-400" />
                  <span>Calendario Menstrual en Menús</span>
                </h4>
                <p className="text-xs text-pink-100/60">
                  Muestra la pestaña del ciclo menstrual y fertilidad en la barra superior.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSettings({
                    menstrualCalendar: {
                      ...settings.menstrualCalendar,
                      enabled: !settings.menstrualCalendar.enabled,
                    },
                  })
                }
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  settings.menstrualCalendar.enabled ? 'bg-pink-500 justify-end' : 'bg-white/20 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* CONFORT VISUAL: LUZ AZUL, ATENUADOR Y BRILLO */}
            <div className="p-4 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                <h4 className="text-sm font-black text-amber-200 uppercase tracking-wider font-heading flex items-center gap-2">
                  <span>🌙</span>
                  <span>Confort Visual & Modo Nocturno</span>
                </h4>
                <span className="text-[10px] text-amber-300 font-bold">Descanso Ocular</span>
              </div>

              {/* 1. FILTRO DE LUZ AZUL */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-200">Filtro de Luz Azul (Tono Cálido)</span>
                  <span className="text-amber-300 font-mono">{settings.blueLightFilter}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={settings.blueLightFilter}
                  onChange={(e) => updateSettings({ blueLightFilter: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between items-center text-[10px] text-white/50 mt-1">
                  <span>Desactivado (0%)</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => updateSettings({ blueLightFilter: 0 })}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      Off
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ blueLightFilter: 35 })}
                      className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 cursor-pointer font-bold"
                    >
                      Suave 35%
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ blueLightFilter: 65 })}
                      className="px-2 py-0.5 rounded bg-amber-600/30 text-amber-200 hover:bg-amber-600/40 cursor-pointer font-bold"
                    >
                      Fuerte 65%
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. BAJAR LA INTENSIDAD DE LUZ (ATENUADOR NOCTURNO) */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-indigo-200">Reducción de Luminosidad (Descanso Visual)</span>
                  <span className="text-indigo-300 font-mono">{settings.nightModeDim}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={settings.nightModeDim}
                  onChange={(e) => updateSettings({ nightModeDim: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between items-center text-[10px] text-white/50 mt-1">
                  <span>Normal (0%)</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => updateSettings({ nightModeDim: 0 })}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      Off
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ nightModeDim: 30 })}
                      className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 cursor-pointer font-bold"
                    >
                      Atenuar 30%
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ nightModeDim: 60 })}
                      className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/40 cursor-pointer font-bold"
                    >
                      Noche Total 60%
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. BRILLO DE PANTALLA */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Brillo General</span>
                  <span className="font-mono text-rose-300">{settings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={settings.brightness}
                  onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* 4. CONTRASTE VISUAL */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Contraste Visual</span>
                  <span className="font-mono text-cyan-300">{settings.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="130"
                  value={settings.contrast}
                  onChange={(e) => updateSettings({ contrast: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleWebShare}
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Share2 className="w-4 h-4 text-sky-300" />
                <span>Compartir App</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: BACKUP, RESTORE & SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-black/40 to-slate-900/40 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <HardDrive className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-wider font-heading">
                  Copia de Seguridad y Restauración de Datos
                </h4>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Guarda una copia completa y cifrada de todas tus notas, fotos, diarios, recordatorios y ajustes. Si reinstalas la app o cambias de teléfono, puedes restaurarlo todo intacto.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={exportEncryptedBackup}
                  className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Crear Copia (.happyduo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => backupRestoreInputRef.current?.click()}
                  className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4 text-emerald-300" />
                  <span>Restaurar Copia</span>
                </button>
                <input
                  ref={backupRestoreInputRef}
                  type="file"
                  accept=".happyduo,.json,.txt"
                  className="hidden"
                  onChange={handleRestoreFileSelected}
                />
              </div>

              {restoreStatus && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs text-center font-bold">
                  {restoreStatus}
                </div>
              )}
            </div>

            {/* Google Authentication */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Autenticación Google Nube</span>
              </h4>

              {firebaseUser ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{firebaseUser.displayName || 'Usuario Google'}</p>
                    <p className="text-[10px] text-white/50">{firebaseUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 rounded-2xl bg-white text-slate-900 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <span>Sincronizar con Google Drive / Cuenta</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
};
