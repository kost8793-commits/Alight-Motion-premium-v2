/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SendLinkForm from './components/SendLinkForm';
import VerifyLinkForm from './components/VerifyLinkForm';
import MusicPlayer from './components/MusicPlayer';
import ApiSettingsModal from './components/ApiSettingsModal';
import { ApiConfig, ServerTargetMode } from './types';
import { Sparkles, ArrowUpRight, Laptop, Globe } from 'lucide-react';

const DEFAULT_API_CONFIG: ApiConfig = {
  serverTarget: 'localhost',
  customEndpoint: '',
  apiKey: '',
  csrfToken: '',
};

export default function App() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      const saved = localStorage.getItem('am_prem_api_config_v3');
      return saved ? JSON.parse(saved) : DEFAULT_API_CONFIG;
    } catch {
      return DEFAULT_API_CONFIG;
    }
  });

  const [prefilledEmail, setPrefilledEmail] = useState<string>('');
  const [prefilledMagicLink, setPrefilledMagicLink] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Persist API configuration
  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    try {
      localStorage.setItem('am_prem_api_config_v3', JSON.stringify(newConfig));
    } catch {
      // LocalStorage error fallback
    }
  };

  // Pre-warm backend connection on mount
  useEffect(() => {
    fetch('/api/session-status').catch(() => {});
  }, []);

  // Called when Step 1 successfully sends or generates the link
  const handleEmailSent = (email: string, magicLink?: string) => {
    setPrefilledEmail(email);
    if (magicLink) {
      setPrefilledMagicLink(magicLink);
    }
  };

  const toggleServerTarget = () => {
    const nextTarget: ServerTargetMode = apiConfig.serverTarget === 'localhost' ? 'maya327' : 'localhost';
    const updated: ApiConfig = { ...apiConfig, serverTarget: nextTarget };
    handleSaveApiConfig(updated);
  };

  return (
    <div className="min-h-screen text-[#161616] flex flex-col justify-between selection:bg-[#ffde59] selection:text-[#161616]">
      <div className="w-full max-w-[1020px] mx-auto px-3 sm:px-6">
        {/* Hero Header */}
        <header className="pt-9 pb-6 sm:pt-12 sm:pb-7">
          <div className="inline-flex items-center gap-2 neo-border bg-[#79e28d] px-3 py-1.5 text-xs font-black tracking-wider neo-shadow-sm mb-4 transform -rotate-1">
            <Sparkles className="w-3.5 h-3.5 text-[#161616]" />
            <span>✦ MENU AM PREM • MODE LOCALHOST &amp; REAL API</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95] text-[#161616] my-4">
            ALIGHT <span className="bg-[#ffde59] px-2 box-decoration-clone">PREMIUM</span>
            <br />
            TOOLS.
          </h1>

          <p className="text-base sm:text-lg font-bold text-neutral-800 max-w-[720px] leading-relaxed">
            Masukkan email akun milikmu, buat/minta link masuk, lalu ajukan verifikasi link
            secara langsung di server localhost atau remote.
          </p>

          {/* Localhost / Server Target Notification Banner */}
          <div className="mt-4 p-3.5 bg-white neo-border neo-shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#79e28d] border-2 border-[#161616] animate-pulse" />
              <span>
                {apiConfig.serverTarget === 'localhost' ? (
                  <>
                    <strong className="text-emerald-800">SERVER LOCALHOST AKTIF:</strong> Berjalan di{' '}
                    <code className="bg-[#79e28d] px-1.5 py-0.5 neo-border-2 font-mono text-[11px] font-black">
                      http://localhost:3000
                    </code>
                  </>
                ) : (
                  <>
                    <strong className="text-blue-800">REMOTE SERVER AKTIF:</strong> Terhubung ke{' '}
                    <code className="bg-[#74c9ff] px-1.5 py-0.5 neo-border-2 font-mono text-[11px] font-black">
                      maya327.my.id/api.php
                    </code>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleServerTarget}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 neo-border text-[11px] font-black cursor-pointer flex items-center gap-1.5"
                title="Ganti Target Server"
              >
                {apiConfig.serverTarget === 'localhost' ? (
                  <>
                    <Globe className="w-3 h-3" />
                    <span>Ubah ke maya327</span>
                  </>
                ) : (
                  <>
                    <Laptop className="w-3 h-3" />
                    <span>Ubah ke Localhost</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="text-[#161616] underline hover:no-underline font-black cursor-pointer flex items-center gap-1 ml-1"
              >
                <span>Pengaturan Server</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dual Flow Grid */}
        <main className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-7">
            {/* Step 1: Send Link */}
            <SendLinkForm
              apiConfig={apiConfig}
              onEmailSent={handleEmailSent}
              initialEmail={prefilledEmail}
            />

            {/* Step 2: Verify Link */}
            <VerifyLinkForm
              apiConfig={apiConfig}
              prefilledEmail={prefilledEmail}
              prefilledMagicLink={prefilledMagicLink}
              consentChecked={consentChecked}
              onConsentRequest={() => {}}
            />
          </div>
        </main>
      </div>

      {/* Background Music Synthesizer Widget */}
      <MusicPlayer />

      {/* API Key & Explanation Settings Modal */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={handleSaveApiConfig}
      />
    </div>
  );
}
