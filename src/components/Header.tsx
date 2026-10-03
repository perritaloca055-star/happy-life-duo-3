import React from 'react';
import { Settings, Shield, UserCheck, Sparkles, LogIn, LogOut } from 'lucide-react';
import { ThreeHeart } from './ThreeHeart';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenExit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenExit }) => {
  const { me, partner, activeRole, toggleRole, firebaseUser, handleGoogleLogin } = useApp();

  return (
    <header className="w-full bg-black/30 border-b border-white/10 px-4 py-3 select-none transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left: 3D Beating Heart */}
        <div className="flex items-center gap-3">
          <ThreeHeart size={50} onHeartClick={toggleRole} />
          <div className="flex flex-col">
            {/* Header Estado actual: Solo texto "Nuestro Lugar Seguro" en blanco */}
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading drop-shadow-sm">
              Nuestro Lugar Seguro
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sincronizados en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Role quick toggle */}
          <button
            type="button"
            onClick={toggleRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 border border-white/15 transition-all shadow-sm cursor-pointer"
            title="Cambiar perspectiva (Tú / Pareja)"
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Viendo como:</span>
            <span className="font-bold text-white">
              {activeRole === 'me' ? me.avatar + ' Tú' : partner.avatar + ' Pareja'}
            </span>
          </button>

          {/* Google Login button if not logged in */}
          {!firebaseUser ? (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/15 transition-all cursor-pointer"
              title="Iniciar sesión con Google"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Google</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
              <Shield className="w-3 h-3" />
              <span>Conectado</span>
            </div>
          )}

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer shadow-md"
            aria-label="Ajustes y Personalización"
            title="Ajustes"
          >
            <Settings className="w-5 h-5 text-white/90" />
          </button>

          {/* Botón Salir de la App con consejo cálido */}
          {onOpenExit && (
            <button
              type="button"
              onClick={onOpenExit}
              className="w-10 h-10 rounded-2xl bg-red-500/20 hover:bg-red-500/30 active:scale-90 text-red-200 border border-red-500/30 flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Salir de la App"
              title="Salir con consejo del día"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
