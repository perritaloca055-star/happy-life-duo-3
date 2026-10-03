import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake,
  Sparkles,
  Dices,
  Smile,
  ShieldCheck,
  Brain,
  MessageCircle,
  HelpCircle,
  Volume2,
  LogOut,
  Sun,
  Sunset,
  Moon,
  Info
} from 'lucide-react';
import { useApp, EMOTION_OPTIONS } from '../context/AppContext';
import { ModalPortal } from './ModalPortal';

export const COMPREHENSIVE_ADVICE = [
  // 1. Recién Casados
  {
    category: 'Parejas Recién Casadas',
    tag: 'Convivencia y Rutina',
    text: 'El primer año de matrimonio no es para convertirse en clones, sino para aprender el mapa interior del otro. Cuando convivan, descubrirán manías y ritmos distintos. En lugar de decir "¿por qué lo haces así?", pregunten con curiosidad: "¿cómo te hace sentir esta forma de hacerlo?".',
    actionTip: 'Elijan 2 tareas del hogar que a cada uno le causen menos estrés sensorial y asuman esas como su especialidad amorosa.'
  },
  {
    category: 'Parejas Recién Casadas',
    tag: 'Comunicación en el Conflicto',
    text: 'En los desacuerdos, recuerden siempre: ustedes dos son un equipo contra la dificultad, nunca el uno contra el otro. Si una discusión sube de tono, activen la "pausa sagrada de 15 minutos": se separan físicamente, beben agua fría, respiran, y vuelven a hablar con el corazón más templado.',
    actionTip: 'Creen una palabra clave divertida (como "Koala" o "Burbuja") que signifique: "Te amo, pero mi mente está abrumada, pausemos 15 minutos".'
  },
  {
    category: 'Parejas Recién Casadas',
    tag: 'Espacio Personal Sagrado',
    text: 'Estar casados no significa renunciar a la individualidad. Pasar horas a solas en su propio rincón no es desamor, es el combustible que permite después reencontrarse con ternura y ganas de compartir.',
    actionTip: 'Establezcan al menos una "tarde libre sin expectativas" a la semana para que cada uno disfrute de sus intereses personales.'
  },

  // 2. Parejas Neurodivergentes en Conjunto
  {
    category: 'Parejas Neurodivergentes',
    tag: 'Doble Empatía',
    text: 'La teoría de la doble empatía nos enseña que las diferencias en cómo procesamos el mundo no son defectos, sino dialectos neurológicos distintos. No supongan que un rostro serio o un silencio significa enfado. Pregunten con gentileza: "¿Estás cansado/a o hay algo que pueda hacer por ti?".',
    actionTip: 'Usen el sistema de colores de la app (Verde, Amarillo, Rojo) para avisar cómo está su batería sin tener que dar explicaciones largas.'
  },
  {
    category: 'Parejas Neurodivergentes',
    tag: 'Descompresión Sensorial Mutua',
    text: 'Al llegar a casa después del trabajo o la calle, ambos sistemas nerviosos están saturados de estímulos. Dense 20 a 30 minutos de "aterrizaje suave" con luces tenues y sin preguntas sobre trámites ni decisiones del día.',
    actionTip: 'Creen una "zona de descarga" en la entrada donde dejar llaves, mochilas y ponerse ropa holgada inmediatamente.'
  },

  // 3. Autismo (TEA)
  {
    category: 'Autismo (TEA) en la Pareja',
    tag: 'Sobrecarga y Shutdown',
    text: 'Durante un shutdown (apagón sensorial y verbal), el cerebro de la persona autista está protegiéndose de un colapso eléctrico. No le exijan respuestas verbales ni contacto visual. La mejor forma de cuidarle es atenuar las luces, ponerle auriculares con cancelación de ruido y acompañar en silencio.',
    actionTip: 'Tengan una tarjeta o emoji pactado que signifique "No puedo hablar ahora, pero sigo aquí contigo".'
  },
  {
    category: 'Autismo (TEA) en la Pareja',
    tag: 'Amor Estructurado y Explícito',
    text: 'La sutileza y las indirectas provocan una tremenda ansiedad en el espectro autista. Decir con total claridad: "Necesito que me abraces por 2 minutos" o "Me gustaría que hoy cenemos a las 20:30" es el mayor acto de ternura y seguridad que pueden brindarse.',
    actionTip: 'Eviten el "haz lo que quieras"; den opciones cerradas: "¿Prefieres pasta o arroz?", "¿Salimos hoy o mañana?".'
  },
  {
    category: 'Autismo (TEA) en la Pareja',
    tag: 'Sensibilidad Táctil y Texturas',
    text: 'A veces el contacto físico puede sentirse doloroso o sobreestimulante si no fue anticipado. Avisen antes de tocar: "Te voy a dar un beso en la mejilla" o pregunten "¿estás para abrazos suaves o abrazos firmes de presión profunda?".',
    actionTip: 'Los abrazos de presión profunda firme (estilo manta pesada) suelen regular el sistema propioceptivo mucho mejor que las caricias leves.'
  },

  // 4. TDAH
  {
    category: 'TDAH (Déficit Atencional & Hiperactividad)',
    tag: 'Ceguera Temporal y Olvidos',
    text: 'Para el cerebro con TDAH solo existen dos momentos en el tiempo: "AHORA" y "NO AHORA". Olvidar sacar la basura o responder un mensaje no es indiferencia ni falta de amor; es una falla orgánica de la memoria de trabajo. Reemplacen el reproche por recordatorios visuales compartidos y alarmas amables.',
    actionTip: 'Coloquen las notas y recordatorios donde la vista tropiece con ellos naturalmente, como la puerta o el refrigerador.'
  },
  {
    category: 'TDAH (Déficit Atencional & Hiperactividad)',
    tag: 'Disforia Sensible al Rechazo (RSD)',
    text: 'Las personas con TDAH experimentan el rechazo real o percibido como un dolor físico desgarrador. Una mirada de frustración puede desatar una tormenta interna de culpa y vergüenza. Si necesitan corregir algo, empiecen siempre por afirmar el amor: "Te amo profundamente, y respecto a la cocina...".',
    actionTip: 'Hagan contacto visual amoroso antes de dar una instrucción o pedir un favor.'
  },
  {
    category: 'TDAH (Déficit Atencional & Hiperactividad)',
    tag: 'Body Doubling (Dupla de Acción)',
    text: 'La presencia física compartida desbloquea la dopamina necesaria para empezar tareas difíciles. Si tu pareja no puede empezar a ordenar o pagar cuentas, siéntate a su lado con un libro o tu té. Tu sola presencia actúa como ancla neurológica.',
    actionTip: 'Usen la función "Música Dúo & Body Doubling" de esta app para acompañarse mientras trabajan o limpian.'
  },

  // 5. TLP (Trastorno Límite de la Personalidad)
  {
    category: 'TLP & Regulación Emocional',
    tag: 'Miedo al Abandono y Apego Seguro',
    text: 'El terror al abandono en el TLP es una alarma de supervivencia arcaica que se dispara ante el menor distanciamiento. Cuando tu pareja con TLP sienta pánico, tu mejor mantra es la presencia firme y tranquila: "Estoy aquí, no me voy a ir, no te voy a dejar. Sigues siendo mi persona favorita".',
    actionTip: 'Antes de salir o desconectarte, deja una nota afectuosa clara: "Voy al supermercado y vuelvo a las 18:00, te amo".'
  },
  {
    category: 'TLP & Regulación Emocional',
    tag: 'Validación antes que Lógica',
    text: 'Nunca le digas a alguien en una crisis de desregulación emocional "estás exagerando" o "eso no tiene sentido". Primero valida el dolor emocional: "Veo que te duele inmensamente y entiendo que te sientas asustado/a". Solo cuando baje la marea fisiológica se puede analizar los hechos.',
    actionTip: 'La fórmula mágica es: Validación ("Tiene sentido tu dolor") + Seguridad ("Estoy contigo") + Calma corporal.'
  },
  {
    category: 'TLP & Regulación Emocional',
    tag: 'Técnica TIPP de Emergencia',
    text: 'Cuando la intensidad emocional supere el 80%: 1. Temperatura: agua muy fría o hielo en las mejillas por 30 segundos (reflejo de inmersión mamífero). 2. Ejercicio intenso 2 minutos. 3. Respiración acompasada (exhala el doble de lo que inhalas). 4. Relajación muscular pareada.',
    actionTip: 'Tengan una bolsita de gel frío en el congelador lista para apoyar en el rostro cuando la emoción sea insoportable.'
  },

  // 6. Consejos de Autoayuda & Calma Inmediata
  {
    category: 'Autoayuda & Calma Inmediata',
    tag: 'Técnica 5-4-3-2-1',
    text: 'Si la mente viaja al futuro catastrófico o a la ansiedad, anclen los sentidos en el presente: nombren en voz alta 5 cosas que puedan ver, 4 que puedan tocar, 3 que puedan oír, 2 que puedan oler y 1 sabor en su boca.',
    actionTip: 'Hagan este ejercicio tomados de la mano y mirándose a los ojos.'
  },
  {
    category: 'Autoayuda & Calma Inmediata',
    tag: 'El Suspiro Fisiológico',
    text: 'Dos inhalaciones cortas y profundas por la nariz seguidas de una exhalación lenta y prolongada por la boca reabren los alvéolos pulmonares y bajan las pulsaciones cardíacas en menos de 30 segundos. Es la forma más rápida y biológica de apagar la ansiedad.',
    actionTip: 'Hagan 3 suspiros fisiológicos seguidos juntos antes de sentarse a conversar sobre temas difíciles.'
  }
];

export const EmotionalSupportSection: React.FC = () => {
  const { me, partner, activeRole, updateMyFeeling } = useApp();

  const [adviceIndex, setAdviceIndex] = useState(0);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null);

  // Gemini modal
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [geminiQuestion, setGeminiQuestion] = useState('');
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Exit dialog
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

  const currentDisplayMe = activeRole === 'me' ? me : partner;

  const filteredAdvice = selectedFilterCategory
    ? COMPREHENSIVE_ADVICE.filter((a) => a.category.includes(selectedFilterCategory))
    : COMPREHENSIVE_ADVICE;

  const currentAdvice = filteredAdvice[adviceIndex % filteredAdvice.length] || COMPREHENSIVE_ADVICE[0];

  const handleNextAdvice = () => {
    setAdviceIndex((prev) => (prev + 1) % filteredAdvice.length);
  };

  // Get greeting according to hour (mañana, tarde, noche)
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 6 && hr < 12) return { text: '¡Que tengas un hermoso día!', icon: <Sun className="w-5 h-5 text-amber-300" /> };
    if (hr >= 12 && hr < 20) return { text: '¡Que tengas una linda tarde!', icon: <Sunset className="w-5 h-5 text-orange-400" /> };
    return { text: '¡Que tengas una noche reparadora!', icon: <Moon className="w-5 h-5 text-indigo-300" /> };
  };

  const greeting = getGreeting();

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeminiLoading(true);
    setGeminiResponse(null);

    setTimeout(() => {
      setGeminiResponse(
        `✨ Guía Psicológica & Neurodivergente Gemini:\n\n` +
        `1. Validación: Lo que estás sintiendo no es una falla personal, es una respuesta natural de tu sistema nervioso.\n` +
        `2. Acción sugerida para la pareja: Apliquen la regla de los 10 minutos de silencio compartido sin exigencia verbal.\n` +
        `3. Recordatorio amoroso: Su vínculo es fuerte y capaz de atravesar cualquier tormenta sensorial o afectiva.`
      );
      setIsGeminiLoading(false);
    }, 1200);
  };

  return (
    <section className="w-full space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 shadow-md">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white font-heading tracking-tight">
              Apoyo Emocional & Salud Neurodivergente
            </h3>
            <p className="text-xs text-white/60">
              Consejos especializados para recién casados, TDAH, TLP y Autismo
            </p>
          </div>
        </div>

        {/* Botón Salir con Despedida Reconfortante */}
        <button
          type="button"
          onClick={() => setIsExitDialogOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir de la App</span>
        </button>
      </div>

      {/* CHECK-IN EMOCIONAL */}
      <div className="glass-card p-6 border-rose-500/20 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h4 className="text-base font-black text-white font-heading uppercase tracking-wide">
              ¿COMO ME SIENTO HOY?
            </h4>
            <p className="text-xs text-white/60">
              Sincronizado al instante con tu pareja en Estado Actual
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2.5">
            <span className="text-2xl">{currentDisplayMe.feelingEmoji}</span>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Estado Emocional</p>
              <p className="text-sm font-bold text-white">{currentDisplayMe.feeling}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {EMOTION_OPTIONS.map((emo) => {
            const isSelected = currentDisplayMe.feeling === emo.label;
            return (
              <button
                key={emo.label}
                type="button"
                onClick={() => updateMyFeeling(emo.label, emo.emoji)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/30 border-rose-400 ring-2 ring-rose-500/40 shadow-lg scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                }`}
              >
                <span className="text-2xl shrink-0">{emo.emoji}</span>
                <span className="text-xs font-bold text-white truncate">{emo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN CONSEJOS NEURODIVERGENTES (TDAH, TLP, AUTISMO, RECIÉN CASADOS) */}
      <div className="glass-card p-6 border-purple-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-300" />
            <h4 className="text-sm font-black text-white font-heading uppercase tracking-wider">
              Biblioteca de Autoayuda & Neurodivergencia
            </h4>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['Recién Casados', 'Autismo', 'TDAH', 'TLP', 'Autoayuda'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedFilterCategory(selectedFilterCategory === cat ? null : cat);
                  setAdviceIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedFilterCategory === cat
                    ? 'bg-purple-500 text-white shadow-md ring-2 ring-purple-300'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjeta Interactiva Táctil que Cambia al Apretar */}
        <motion.div
          key={currentAdvice.text}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleNextAdvice}
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-black/50 to-slate-900/50 border-2 border-purple-400/40 hover:border-purple-400/70 shadow-2xl space-y-3 cursor-pointer select-none active:scale-[0.98] transition-all relative group"
        >
          <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentAdvice.category}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 border border-purple-400/30 px-2.5 py-0.5 rounded-full text-[11px] text-purple-200">
                {currentAdvice.tag}
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {((adviceIndex % filteredAdvice.length) + 1)}/{filteredAdvice.length}
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-white/95 leading-relaxed font-semibold">
            "{currentAdvice.text}"
          </p>

          {currentAdvice.actionTip && (
            <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-400/25 flex items-start gap-2.5 text-xs text-purple-100">
              <span className="text-base shrink-0">💡</span>
              <div>
                <span className="font-black text-amber-200 block text-[11px] uppercase tracking-wider">
                  Paso Práctico para los Dos:
                </span>
                <span>{currentAdvice.actionTip}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-white/50">
            <span className="flex items-center gap-1 text-purple-300 font-bold group-hover:text-purple-200">
              <span>👆 Toca esta tarjeta para ver el siguiente consejo</span>
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-lg text-white/70">
              Siguiente 🎴
            </span>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleNextAdvice}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 cursor-pointer transition-all shadow-md"
          >
            <Dices className="w-4 h-4 text-purple-300 animate-spin" />
            <span>Cambiar Tarjeta al Azar 🎲</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGeminiModalOpen(true)}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Pregúntale a Gemini ✨</span>
          </button>
        </div>
      </div>

      {/* MODAL SALIR CON MENSAJE RECONFORTANTE */}
      <ModalPortal
        isOpen={isExitDialogOpen}
        onClose={() => setIsExitDialogOpen(false)}
        title="Hasta pronto con amor"
        icon={<HeartHandshake className="w-6 h-6 text-rose-400" />}
      >
        <div className="space-y-4 text-center text-white py-2">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center mx-auto text-3xl shadow-lg">
            {greeting.icon}
          </div>

          <h3 className="text-xl font-black font-heading text-rose-200">
            {greeting.text}
          </h3>

          <p className="text-sm text-white/80 leading-relaxed max-w-sm mx-auto font-medium">
            "Recuerda que no tienes que ser perfecto/a para ser profundamente amado/a. Respira, descansa tu mente y recuerda que siempre tienen este lugar seguro juntos."
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsExitDialogOpen(false)}
              className="px-8 py-3 rounded-2xl btn-3d-rose text-white font-bold text-xs cursor-pointer shadow-lg"
            >
              Entendido ❤️ Cerrar
            </button>
          </div>
        </div>
      </ModalPortal>

      {/* MODAL GEMINI */}
      <ModalPortal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        title="Consejero Empático Gemini ✨"
        icon={<Sparkles className="w-6 h-6 text-amber-400" />}
      >
        <div className="space-y-4 text-white">
          <p className="text-xs text-white/70">
            Pregunta cualquier duda sobre cómo gestionar una emoción, discusión o sobrecarga en pareja:
          </p>

          <form onSubmit={handleAskGemini} className="space-y-3">
            <textarea
              rows={3}
              value={geminiQuestion}
              onChange={(e) => setGeminiQuestion(e.target.value)}
              placeholder={`Ej. Me siento ${currentDisplayMe.feeling} y mi pareja tiene TDAH/Autismo, ¿cómo coordinamos el día?...`}
              className="w-full p-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:border-purple-400 resize-none"
            />

            <button
              type="submit"
              disabled={isGeminiLoading}
              className="w-full py-3.5 rounded-2xl btn-3d-rose text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isGeminiLoading ? 'Gemini está reflexionando...' : 'Obtener Consejo ✨'}</span>
            </button>
          </form>

          {geminiResponse && (
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-400/40 text-xs text-purple-100 whitespace-pre-line leading-relaxed shadow-inner">
              {geminiResponse}
            </div>
          )}
        </div>
      </ModalPortal>
    </section>
  );
};
