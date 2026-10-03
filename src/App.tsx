import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CurrentStatus } from './components/CurrentStatus';
import { RemindersSection } from './components/RemindersSection';
import { AlarmClockSection } from './components/AlarmClockSection';
import { LifeJournalSection } from './components/LifeJournalSection';
import { LocationSection } from './components/LocationSection';
import { RecorderCard } from './components/RecorderCard';
import { EmotionalSupportSection } from './components/EmotionalSupportSection';
import { MenstrualCard } from './components/MenstrualCard';
import { MiniChatModal } from './components/MiniChatModal';
import { BodyDoublingModal } from './components/BodyDoublingModal';
import { SettingsModal } from './components/SettingsModal';
import { SubmenuNav } from './components/SubmenuNav';
import { COMPREHENSIVE_ADVICE } from './components/EmotionalSupportSection';
import { Lock, Heart, Sparkles, X, Brain } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { settings, updateSettings, setActiveMenu, me } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [pinAttempt, setPinAttempt] = useState('');
  const [pinError, setPinError] = useState(false);

  // Splash card con micro-aprendizaje al abrir la app
  const [welcomeTip, setWelcomeTip] = useState<{ category: string; tag: string; text: string; actionTip?: string } | null>(null);

  // Sincronizar colores globales de texto y subtexto en todo el documento
  useEffect(() => {
    document.documentElement.style.setProperty('--app-text-color', settings.textColor || '#ffffff');
    document.documentElement.style.setProperty('--app-subtext-color', settings.subtextColor || '#cbd5e1');
  }, [settings.textColor, settings.subtextColor]);

  // Touch gesture state for finger swipe navigation across menus
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    const randomItem = COMPREHENSIVE_ADVICE[Math.floor(Math.random() * COMPREHENSIVE_ADVICE.length)];
    setWelcomeTip(randomItem);
  }, []);

  const getGreetingData = () => {
    const hr = new Date().getHours();
    if (hr >= 6 && hr < 12) return { text: `¡Que tengas un buen día, ${me.name}! 🌅`, time: 'mañana' };
    if (hr >= 12 && hr < 20) return { text: `¡Que tengas una buena tarde, ${me.name}! ☀️`, time: 'tarde' };
    return { text: `¡Que tengas una buena noche, ${me.name}! 🌙`, time: 'noche' };
  };

  const greeting = getGreetingData();
  const exitTip = COMPREHENSIVE_ADVICE[(COMPREHENSIVE_ADVICE.length - 2 + new Date().getDate()) % COMPREHENSIVE_ADVICE.length];

  const activeSections = settings.activeSectionsOrder.filter(
    (secId) => secId !== 'menstrual' || settings.menstrualCalendar.enabled
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Deslizamiento horizontal con el dedo mayor a 55px que no sea un scroll vertical
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      const curIdx = activeSections.indexOf(settings.activeMenu);
      if (deltaX < 0) {
        // Deslizó hacia la izquierda -> Menú siguiente (loop continuo)
        const nextIdx = (curIdx + 1) % activeSections.length;
        setActiveMenu(activeSections[nextIdx]);
      } else {
        // Deslizó hacia la derecha -> Menú previo (loop continuo)
        const prevIdx = (curIdx - 1 + activeSections.length) % activeSections.length;
        setActiveMenu(activeSections[prevIdx]);
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // PIN Lock check
  if (settings.securityPin && settings.isLocked) {
    const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (pinAttempt === settings.securityPin) {
        updateSettings({ isLocked: false });
        setPinAttempt('');
        setPinError(false);
      } else {
        setPinError(true);
        setPinAttempt('');
      }
    };

    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0d14] text-white">
        <div className="max-w-xs w-full glass-card p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 mx-auto text-2xl shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black font-heading">Nuestro Lugar Seguro</h2>
          <p className="text-xs text-white/60">Ingresa tu PIN de 4 dígitos para acceder a sus diarios y recuerdos:</p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              maxLength={4}
              value={pinAttempt}
              onChange={(e) => setPinAttempt(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full py-3 text-center text-2xl font-black tracking-widest rounded-2xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-rose-400"
            />
            {pinError && <p className="text-xs text-rose-400 font-bold">PIN incorrecto, intenta de nuevo.</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl btn-3d-rose text-white font-bold text-xs cursor-pointer shadow-lg"
            >
              Desbloquear Amor
            </button>
          </form>
        </div>
      </div>
    );
  }

  const fontSizeClass =
    settings.fontSize === 'extralarge'
      ? 'text-lg'
      : settings.fontSize === 'large'
      ? 'text-base'
      : 'text-sm';

  // Render ONLY the active single menu (No "Ver Todo", completely independent)
  const renderCurrentSection = () => {
    switch (settings.activeMenu) {
      case 'status':
        return <CurrentStatus />;
      case 'reminders':
        return <RemindersSection />;
      case 'alarms':
        return <AlarmClockSection />;
      case 'journal':
        return <LifeJournalSection />;
      case 'location':
        return <LocationSection />;
      case 'recorder':
        return <RecorderCard />;
      case 'emotional':
        return <EmotionalSupportSection />;
      case 'menstrual':
        return <MenstrualCard />;
      default:
        return <CurrentStatus />;
    }
  };

  const screenFitClass =
    settings.screenFit === 'compact'
      ? 'scale-90 origin-top max-w-md'
      : settings.screenFit === 'fullscreen'
      ? 'max-w-none px-2 w-full'
      : settings.screenFit === 'qhd'
      ? 'scale-105 origin-top max-w-5xl'
      : '';

  return (
    <div
      className={`min-h-screen w-full relative ${fontSizeClass} transition-colors duration-500`}
      style={{
        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
        color: settings.textColor,
      }}
    >
      {/* MODO FILTRO DE LUZ AZUL (CALIDEZ NOCTURNA) */}
      {settings.blueLightFilter > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-[999998] transition-opacity duration-300"
          style={{
            backgroundColor: '#f59e0b',
            mixBlendMode: 'multiply',
            opacity: (settings.blueLightFilter / 100) * 0.45,
          }}
        />
      )}

      {/* MODO BAJAR INTENSIDAD DE LUZ / ATENUADOR NOCTURNO DE DESCANSO VISUAL */}
      {settings.nightModeDim > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-[999997] transition-opacity duration-300 bg-black"
          style={{
            opacity: (settings.nightModeDim / 100) * 0.85,
          }}
        />
      )}

      {/* FONDO QUE AFECTA A TODA LA PANTALLA UNIFORME AL 100% */}
      {settings.customBgImage ? (
        <div
          className="fixed inset-0 min-h-screen w-full -z-50 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url(${settings.customBgImage})` }}
        />
      ) : settings.backgroundTheme && settings.backgroundTheme !== 'mesh-aurora-dark' ? (
        <div
          className={`fixed inset-0 min-h-screen w-full -z-50 ${settings.backgroundTheme} transition-all duration-700`}
        />
      ) : (
        /* Aurora Dinámica Pantalla Completa Uniforme */
        <div className="fixed inset-0 min-h-screen w-full -z-50 bg-[#090c12] overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[65vw] h-[65vw] rounded-full bg-[#722f37]/50 blur-[130px] pointer-events-none animate-aurora" />
          <div className="absolute top-[30%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#2563eb]/45 blur-[140px] pointer-events-none animate-aurora" />
          <div className="absolute bottom-[-10%] left-[10%] w-[55vw] h-[55vw] rounded-full bg-[#556b2f]/45 blur-[130px] pointer-events-none animate-aurora" />
          <div className="absolute top-[60%] right-[25%] w-[50vw] h-[50vw] rounded-full bg-[#38bdf8]/35 blur-[150px] pointer-events-none animate-aurora" />
        </div>
      )}

      {/* Capa SVG Noise uniforme */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none -z-40 opacity-[0.035]">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* TARJETA SPLASH DE BIENVENIDA CON CONSEJO AL AZAR */}
      <AnimatePresence>
        {welcomeTip && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-md p-6 rounded-[2.5rem] bg-gradient-to-br from-purple-950/90 via-[#181a2e]/95 to-slate-900/95 border-2 border-purple-400/50 shadow-2xl backdrop-blur-2xl text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                    <Brain className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-200">
                      Sabiduría para Nuestro Vínculo 🌿
                    </h4>
                    <span className="text-[10px] text-white/50">{welcomeTip.category}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWelcomeTip(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {welcomeTip.tag}
                </span>
                <p className="text-sm font-semibold text-white/95 leading-relaxed">
                  "{welcomeTip.text}"
                </p>
                {welcomeTip.actionTip && (
                  <p className="text-xs text-purple-200/90 italic pt-1">
                    💡 <span className="font-bold">Para hoy:</span> {welcomeTip.actionTip}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const nextTip = COMPREHENSIVE_ADVICE[Math.floor(Math.random() * COMPREHENSIVE_ADVICE.length)];
                    setWelcomeTip(nextTip);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Otro consejo 🎲</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeTip(null)}
                  className="flex-1 py-2.5 rounded-xl btn-3d-rose text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Entrar con amor 💖</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Sticky removido: Desaparece al bajar por la app naturalmente */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExit={() => setIsExitOpen(true)}
      />

      {/* Contenedor Principal con Soporte de Deslizamiento Táctil con el Dedo */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`max-w-4xl mx-auto px-4 py-6 space-y-6 ${screenFitClass} transition-transform duration-200`}
      >
        {/* Barra de Menús Independientes con Emojis Móviles (Sin 'Ver Todo') */}
        <SubmenuNav />

        {/* Solo la sección activa se muestra (Menú 100% independiente) */}
        <div className="w-full transition-all duration-300">
          {renderCurrentSection()}
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-20 text-center space-y-1.5 select-none border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-white/80">
            <span>Happy Life Duo</span>
            <span>•</span>
            <span className="text-rose-400">Nuestro Lugar Seguro</span>
          </div>
          <p className="text-[11px] text-white/50">
            Desliza tu dedo hacia los lados para cambiar de menú fácilmente.
          </p>
        </footer>
      </main>

      {/* Botones Flotantes */}
      <BodyDoublingModal />
      <MiniChatModal />

      {/* Modal de Ajustes */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* MODAL DE DESPEDIDA AL SALIR DE LA APP */}
      <AnimatePresence>
        {isExitOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-sm p-6 rounded-[2.5rem] bg-gradient-to-br from-rose-950/90 via-[#1e1526]/95 to-slate-900/95 border-2 border-rose-400/50 shadow-2xl backdrop-blur-2xl text-white text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center mx-auto text-3xl shadow-lg">
                {greeting.time === 'mañana' ? '🌅' : greeting.time === 'tarde' ? '☀️' : '🌙'}
              </div>

              <h3 className="text-xl font-black font-heading text-rose-200">
                {greeting.text}
              </h3>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90 leading-relaxed font-medium">
                "{exitTip.text}"
              </div>

              <p className="text-[11px] text-white/50">
                Recuerden que su amor y su paciencia mutua son su mayor fortaleza.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ isLocked: true });
                    setIsExitOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl btn-3d-rose text-white font-black text-xs cursor-pointer shadow-lg"
                >
                  Bloquear y Salir con Amor 🔒
                </button>
                <button
                  type="button"
                  onClick={() => setIsExitOpen(false)}
                  className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                >
                  Quedarme en Nuestro Lugar Seguro 💖
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
