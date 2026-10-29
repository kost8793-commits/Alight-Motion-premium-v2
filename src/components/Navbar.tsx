import React from 'react';
import { Key, RefreshCw, Zap } from 'lucide-react';
import { ApiConfig } from '../types';

interface NavbarProps {
  apiConfig: ApiConfig;
  onOpenSettings: () => void;
  onReset: () => void;
}

export default function Navbar({ apiConfig, onOpenSettings, onReset }: NavbarProps) {
  return (
    <nav className="mt-4 sm:mt-5 neo-border neo-shadow bg-[#ffde59] p-3 sm:p-4 flex items-center justify-between gap-3">
      {/* Brand logo & wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onReset();
        }}
        className="flex items-center gap-2.5 sm:gap-3 text-[#161616] no-underline font-black tracking-tight"
      >
        <span className="w-9 h-9 sm:w-11 sm:h-11 bg-white neo-border flex items-center justify-center text-xl sm:text-2xl font-black -rotate-4 shadow-[2px_2px_0_#161616]">
          A
        </span>
        <span className="text-sm sm:text-base tracking-tighter uppercase whitespace-nowrap">
          GET ALIGHT PREMIUM
        </span>
      </a>

      {/* Action Zone: Mode Badge + API Key & Settings Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white neo-border text-xs font-black">
          <span className="w-2.5 h-2.5 rounded-full bg-[#79e28d] animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-[#161616]">
            {apiConfig.customEndpoint ? 'Custom Server' : 'Real Server Maya327'}
          </span>
        </div>

        {/* API Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-3 sm:px-4 py-2 bg-white neo-border text-[#161616] text-xs font-black neo-shadow-sm neo-btn flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          title="Buka Status Server & Pengaturan API"
        >
          <Zap className="w-3.5 h-3.5 text-[#161616]" />
          <span>STATUS &amp; API</span>
        </button>

        {/* Refresh / Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="p-2 bg-[#74c9ff] neo-border text-[#161616] neo-shadow-sm neo-btn flex items-center justify-center cursor-pointer"
          title="Muat Ulang Form"
          aria-label="Muat Ulang Halaman"
        >
          <RefreshCw className="w-4 h-4 text-[#161616]" />
        </button>
      </div>
    </nav>
  );
}
