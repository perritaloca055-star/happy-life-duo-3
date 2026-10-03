import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Clock,
  Sparkles,
  Heart,
  Smile,
  Leaf,
  Edit2,
  Check,
  Skull
} from 'lucide-react';
import {
  useApp,
  STATUS_OPTIONS,
  AVATAR_OPTIONS,
} from '../context/AppContext';
import { StatusOption } from '../types';
import { ModalPortal } from './ModalPortal';

// Componente visual de Pila / Batería Real con rayitas/segmentos internos y niveles exactos
const VisualBattery: React.FC<{ percentage: number; isInteractive?: boolean; onChange?: (val: number) => void }> = ({
  percentage,
  isInteractive = false,
  onChange,
}) => {
  // Reglas exactas solicitadas:
  // - 0% a 29%: Rojo (nivel crítico / agotada con calavera 💀)
  // - 30% a 49%: Amarillo (nivel bajo 🪫)
  // - 50% a 79%: Naranja (recargando ⚡)
  // - 80% a 95%: Verde claro (alta ✨)
  // - 96% a 100%: Verde oscuro (batería completa 🔋)
  const getLevelConfig = (pct: number) => {
    if (pct === 0) {
      return {
        fillBg: 'bg-red-600',
        textColor: 'text-red-400',
        label: '0% Agotada 💀',
        icon: '💀',
        glow: 'shadow-red-600/60',
        borderColor: 'border-red-500/60',
      };
    }
    if (pct <= 29) {
      return {
        fillBg: 'bg-red-500',
        textColor: 'text-red-400',
        label: `${pct}% Nivel Crítico 🛑`,
        icon: '🪫',
        glow: 'shadow-red-500/50',
        borderColor: 'border-red-500/40',
      };
    }
    if (pct <= 49) {
      return {
        fillBg: 'bg-amber-400',
        textColor: 'text-amber-300',
        label: `${pct}% Nivel Bajo`,
        icon: '🪫',
        glow: 'shadow-amber-400/50',
        borderColor: 'border-amber-400/40',
      };
    }
    if (pct <= 79) {
      return {
        fillBg: 'bg-orange-500',
        textColor: 'text-orange-400',
        label: `${pct}% Recargando ⚡`,
        icon: '⚡',
        glow: 'shadow-orange-500/50',
        borderColor: 'border-orange-500/40',
      };
    }
    if (pct <= 95) {
      return {
        fillBg: 'bg-emerald-400',
        textColor: 'text-emerald-300',
        label: `${pct}% Alta ✨`,
        icon: '🔋',
        glow: 'shadow-emerald-400/50',
        borderColor: 'border-emerald-400/40',
      };
    }
    return {
      fillBg: 'bg-[#15803d]', // Verde oscuro
      textColor: 'text-emerald-400',
      label: '100% Completa ⚡',
      icon: '🔋',
      glow: 'shadow-emerald-700/60',
      borderColor: 'border-emerald-500/50',
    };
  };

  const config = getLevelConfig(percentage);
  const totalSegments = 10; // 10 rayitas internas estilo smartphone battery

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-white/90">
          <span className="text-base">{config.icon}</span>
          <span>Batería Social</span>
        </div>
        <span className={`font-black text-sm ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      {/* Forma Física de Pila / Batería con Rayitas Internas Segmentadas */}
      <div className="flex items-center gap-1">
        <div
          className={`relative flex-1 h-9 rounded-2xl bg-black/80 p-1.5 border-2 ${config.borderColor} shadow-inner flex items-center gap-1 transition-colors duration-300`}
        >
          {/* Rayitas / Celdas internas que se llenan como un icono de batería real */}
          {Array.from({ length: totalSegments }).map((_, idx) => {
            const segThreshold = (idx + 1) * 10;
            const isLit = percentage >= segThreshold - 5;
            const isCriticalPulse = percentage <= 29 && percentage > 0 && isLit;

            return (
              <div
                key={idx}
                className={`h-full flex-1 rounded-md transition-all duration-300 ${
                  isLit
                    ? `${config.fillBg} ${config.glow} shadow-sm ${
                        isCriticalPulse ? 'animate-pulse' : ''
                      }`
                    : 'bg-white/5 border border-white/5'
                }`}
              />
            );
          })}

          {/* Calavera animada en el centro si está en 0% */}
          {percentage === 0 && (
            <div className="absolute inset-0 flex items-center justify-center gap-1 text-red-300 text-xs font-black bg-red-950/85 rounded-xl animate-pulse">
              <span>💀</span>
              <span>AGOTADA</span>
            </div>
          )}
        </div>

        {/* Polo positivo terminal de la batería */}
        <div className="w-2 h-5 rounded-r-md bg-white/40 border border-l-0 border-white/30 shrink-0" />
      </div>

      {/* Slider interactivo si es mi tarjeta */}
      {isInteractive && onChange && (
        <div className="pt-1">
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none bg-white/20 cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-white/50 font-bold px-1 mt-1">
            <span className="text-red-400">0%-29% Rojo 💀</span>
            <span className="text-amber-400">30%-49% Amarillo</span>
            <span className="text-orange-400">50%-79% Naranja</span>
            <span className="text-emerald-400">80%-95% Verde</span>
            <span className="text-[#15803d] font-black">100% Verde Oscuro</span>
          </div>
        </div>
      )}

      {percentage === 0 && (
        <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs leading-relaxed mt-2 shadow-lg">
          <strong className="block text-red-300 mb-1">
            Batería en 0% (Agotada 💀):
          </strong>
          La persona solo quiere estar sola y tranquila por un tiempo para recargar su sistema nervioso sin presiones.
        </div>
      )}
    </div>
  );
};

export const CurrentStatus: React.FC = () => {
  const {
    me,
    partner,
    activeRole,
    updateUserName,
    updateMyStatus,
    updateMySocialBattery,
    sendPauseNotice,
  } = useApp();

  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [editingAvatarTarget, setEditingAvatarTarget] = useState<'me' | 'partner'>('me');

  // Renaming state
  const [isRenamingTarget, setIsRenamingTarget] = useState<'me' | 'partner' | null>(null);
  const [tempName, setTempName] = useState('');

  const PAUSE_OPTIONS = [
    {
      title: 'Tiempo en silencio breve',
      text: 'Necesito un pequeño tiempo en silencio para recargarme, todo está bien contigo mi amor ❤',
      icon: '🤫',
    },
    {
      title: 'Sobrecarga sensorial',
      text: 'Tengo sobrecarga sensorial, voy a ponerme auriculares 30 minutos 🎧',
      icon: '🎧',
    },
    {
      title: 'Batería social muy baja',
      text: 'Estoy con batería social muy baja, te amo y luego te escribo o te llamo 🌿',
      icon: '🔋',
    },
    {
      title: 'Descanso prolongado',
      text: 'Necesito un largo descanso, te escribo en cuanto pueda 🥺',
      icon: '🛌',
    },
  ];

  const currentDisplayMe = activeRole === 'me' ? me : partner;
  const currentDisplayPartner = activeRole === 'me' ? partner : me;

  const handleOpenRename = (target: 'me' | 'partner') => {
    setIsRenamingTarget(target);
    setTempName(target === 'me' ? currentDisplayMe.name : currentDisplayPartner.name);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRenamingTarget) {
      updateUserName(isRenamingTarget === 'me' ? activeRole : (activeRole === 'me' ? 'partner' : 'me'), tempName);
      setIsRenamingTarget(null);
    }
  };

  return (
    <section className="w-full space-y-6">
      {/* 1. TARJETA DE LA PAREJA (ORDEN OBLIGATORIO: ARRIBA PRIMERO) */}
      <motion.div
        whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ perspective: 1000 }}
        className="glass-card p-6 relative overflow-hidden border-rose-500/30"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Partner Name con botón de cambiar nombre */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setEditingAvatarTarget('partner');
                  setIsAvatarModalOpen(true);
                }}
                className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-400/40 flex items-center justify-center text-3xl shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title="Cambiar avatar de tu pareja"
              >
                {currentDisplayPartner.avatar}
              </button>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#121826] flex items-center justify-center" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Pareja ❤️
                </span>
                <span className="text-xs text-white/50">Prioridad Máxima</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-2xl font-black text-white font-heading">
                  {currentDisplayPartner.name}
                </h2>
                <button
                  type="button"
                  onClick={() => handleOpenRename('partner')}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white cursor-pointer transition-all"
                  title="Cambiar nombre de pareja"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Partner Current Status Large Badge */}
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 border border-white/20 shadow-md">
              <span className="text-2xl">{currentDisplayPartner.statusEmoji}</span>
              <div className="text-left">
                <p className="text-[10px] text-white/60 uppercase font-semibold">Estado actual</p>
                <p className="text-sm font-bold text-white leading-tight">
                  {currentDisplayPartner.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pause Banner if partner activated pause */}
        {currentDisplayPartner.pauseNotice && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 flex items-start gap-3 shadow-lg">
            <span className="text-2xl">🌿</span>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-amber-300">
                Pausa activa de tu pareja ({currentDisplayPartner.pauseNotice.timestamp})
              </p>
              <p className="text-sm font-medium mt-0.5">
                "{currentDisplayPartner.pauseNotice.text}"
              </p>
            </div>
          </div>
        )}

        {/* Batería Social con icono de pila real */}
        <div className="mb-4 bg-white/5 p-4 rounded-3xl border border-white/10">
          <VisualBattery percentage={currentDisplayPartner.socialBattery} />
        </div>

        {/* Grid: Last Action, Last Location, and Synchronized "Me siento" */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white/50 text-[10px] uppercase font-bold">Última acción</p>
              <p className="font-semibold text-white/90 line-clamp-1 mt-0.5">
                {currentDisplayPartner.lastAction}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">{currentDisplayPartner.lastActionTime}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white/50 text-[10px] uppercase font-bold">Última ubicación</p>
              <p className="font-semibold text-white/90 line-clamp-1 mt-0.5">
                {currentDisplayPartner.lastLocation?.name || 'En casa 🏡'}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">
                {currentDisplayPartner.lastLocation?.updatedAt || 'Reciente'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <Smile className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white/50 text-[10px] uppercase font-bold">Se siente</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base">{currentDisplayPartner.feelingEmoji}</span>
                <span className="font-bold text-white/90">{currentDisplayPartner.feeling}</span>
              </div>
              <p className="text-[10px] text-white/50 mt-0.5">
                {currentDisplayPartner.feelingUpdatedAt}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. TARJETA MÍA (ORDEN OBLIGATORIO: ABAJO) */}
      <motion.div
        whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ perspective: 1000 }}
        className="glass-card p-6 relative overflow-hidden border-emerald-500/30"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: My Name con botón de cambiar nombre */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setEditingAvatarTarget('me');
                  setIsAvatarModalOpen(true);
                }}
                className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-3xl shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title="Cambiar mi avatar"
              >
                {currentDisplayMe.avatar}
              </button>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#121826] flex items-center justify-center" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tú 🌿
                </span>
                <span className="text-xs text-white/50">Tu espacio</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-2xl font-black text-white font-heading">
                  {currentDisplayMe.name}
                </h2>
                <button
                  type="button"
                  onClick={() => handleOpenRename('me')}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white cursor-pointer transition-all"
                  title="Cambiar mi nombre"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 border border-white/20 shadow-md">
              <span className="text-2xl">{currentDisplayMe.statusEmoji}</span>
              <div className="text-left">
                <p className="text-[10px] text-white/60 uppercase font-semibold">Mi Estado actual</p>
                <p className="text-sm font-bold text-white leading-tight">
                  {currentDisplayMe.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Tap Status Change with Huge Emojis */}
        <div className="mb-5">
          <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2.5">
            Cambiar estado en 1 tap:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = currentDisplayMe.status === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => updateMyStatus(opt.label, opt.emoji)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/25 border-rose-400 shadow-md shadow-rose-900/30 scale-[1.02]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl shrink-0">{opt.emoji}</span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white leading-tight truncate">
                      {opt.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Batería Social Mía Interactiva con Niveles Visuales */}
        <div className="mb-5 bg-white/5 p-4 rounded-3xl border border-white/10">
          <VisualBattery
            percentage={currentDisplayMe.socialBattery}
            isInteractive
            onChange={updateMySocialBattery}
          />
        </div>

        {/* Sync with "Me Siento" check-in */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-xl">
              {currentDisplayMe.feelingEmoji}
            </div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Me siento actualmente</p>
              <p className="text-sm font-bold text-white">{currentDisplayMe.feeling}</p>
            </div>
          </div>
          <span className="text-xs text-white/50 font-medium">
            {currentDisplayMe.feelingUpdatedAt}
          </span>
        </div>

        {/* BOTÓN GIGANTE: "Necesito una pausa 🌿" */}
        <button
          type="button"
          onClick={() => setIsPauseModalOpen(true)}
          className="w-full p-4 rounded-3xl btn-3d-olive flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-wide text-white font-heading">
            <Leaf className="w-6 h-6 text-lime-200 animate-pulse" />
            <span>Necesito una pausa 🌿</span>
          </div>
          <p className="text-xs text-lime-100/90 text-center font-normal px-2">
            Avisa a tu pareja que necesitas silencio o desconexión total sin generar alarma ni sensación de rechazo.
          </p>
        </button>
      </motion.div>

      {/* MODAL: CAMBIAR NOMBRE */}
      <ModalPortal
        isOpen={isRenamingTarget !== null}
        onClose={() => setIsRenamingTarget(null)}
        title={isRenamingTarget === 'me' ? 'Cambiar mi Nombre' : 'Cambiar Nombre de mi Pareja'}
        icon={<Edit2 className="w-6 h-6 text-rose-400" />}
      >
        <form onSubmit={handleSaveRename} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
              Ingresa el nuevo nombre o apodo cariñoso:
            </label>
            <input
              type="text"
              required
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Ej. Mi Vida, Amor, etc."
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-rose-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsRenamingTarget(null)}
              className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl btn-3d-rose text-white font-bold text-xs cursor-pointer"
            >
              Guardar Nombre
            </button>
          </div>
        </form>
      </ModalPortal>

      {/* MODAL: NECESITO UNA PAUSA 🌿 */}
      <ModalPortal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        title="Avisar que necesitas una pausa 🌿"
        icon={<Leaf className="w-6 h-6 text-lime-400" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-white/80 leading-relaxed">
            Elige el mensaje que mejor exprese tu necesidad en este momento. Se enviará con amor y empatía:
          </p>

          <div className="space-y-3">
            {PAUSE_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sendPauseNotice(idx);
                  setIsPauseModalOpen(false);
                }}
                className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 hover:border-lime-400/50 text-left flex items-start gap-3 transition-all cursor-pointer group"
              >
                <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  {opt.icon}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-lime-300">
                    {opt.title}
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    "{opt.text}"
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </ModalPortal>

      {/* MODAL: CAMBIAR AVATAR */}
      <ModalPortal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="Elige o Escribe tu Avatar / Emoji Alegre"
        icon={<Smile className="w-6 h-6 text-rose-400" />}
      >
        <div className="space-y-4 text-white">
          {/* Opción para escribir o pegar cualquier emoji tipo WhatsApp */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <label className="block text-xs font-bold text-white/90">
              Personalizado: Pega o escribe un emoji tipo WhatsApp:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                placeholder="Pega tu emoji aquí (ej. 🥰, 🥑, 💘)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-base focus:outline-none focus:border-rose-400 text-center font-bold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const customEmoji = e.currentTarget.value.trim();
                    if (editingAvatarTarget === 'me') {
                      if (activeRole === 'me') me.avatar = customEmoji;
                      else partner.avatar = customEmoji;
                    } else {
                      if (activeRole === 'me') partner.avatar = customEmoji;
                      else me.avatar = customEmoji;
                    }
                    localStorage.setItem('happyduo_me_avatar', customEmoji);
                    setIsAvatarModalOpen(false);
                  }
                }}
                id="custom-emoji-input"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('custom-emoji-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const customEmoji = input.value.trim();
                    if (editingAvatarTarget === 'me') {
                      if (activeRole === 'me') me.avatar = customEmoji;
                      else partner.avatar = customEmoji;
                    } else {
                      if (activeRole === 'me') partner.avatar = customEmoji;
                      else me.avatar = customEmoji;
                    }
                    localStorage.setItem('happyduo_me_avatar', customEmoji);
                    setIsAvatarModalOpen(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl btn-3d-rose text-white text-xs font-bold cursor-pointer shrink-0"
              >
                Aplicar
              </button>
            </div>
            <p className="text-[11px] text-white/50">
              Acepta cualquier emoji de tu teclado móvil o avatar kawaii.
            </p>
          </div>

          <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
            O selecciona de la colección animada (120+ opciones):
          </p>

          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5 max-h-[50vh] overflow-y-auto p-1 scrollbar-thin">
            {AVATAR_OPTIONS.map((av, idx) => (
              <button
                key={`${av}-${idx}`}
                type="button"
                onClick={() => {
                  if (editingAvatarTarget === 'me') {
                    if (activeRole === 'me') me.avatar = av;
                    else partner.avatar = av;
                  } else {
                    if (activeRole === 'me') partner.avatar = av;
                    else me.avatar = av;
                  }
                  localStorage.setItem('happyduo_me_avatar', av);
                  setIsAvatarModalOpen(false);
                }}
                className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/20 active:scale-90 border border-white/10 flex items-center justify-center text-2xl transition-all cursor-pointer shadow-sm hover:border-rose-400"
              >
                <span className="hover:scale-125 transition-transform duration-200">
                  {av}
                </span>
              </button>
            ))}
          </div>
        </div>
      </ModalPortal>
    </section>
  );
};
