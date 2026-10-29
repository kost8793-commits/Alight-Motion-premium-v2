import React, { useState, useEffect } from 'react';
import { X, Key, Server, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Laptop, Globe, Terminal, Copy } from 'lucide-react';
import { ApiConfig, ServerTargetMode } from '../types';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

export default function ApiSettingsModal({
  isOpen,
  onClose,
  config,
  onSave,
}: ApiSettingsModalProps) {
  const [serverTarget, setServerTarget] = useState<ServerTargetMode>(config.serverTarget || 'localhost');
  const [customEndpoint, setCustomEndpoint] = useState<string>(config.customEndpoint);
  const [apiKey, setApiKey] = useState<string>(config.apiKey);
  const [csrfToken, setCsrfToken] = useState<string>(config.csrfToken);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  // Live session status from backend
  const [sessionInfo, setSessionInfo] = useState<{
    status: string;
    server?: string;
    csrf?: string;
    sessionAgeSeconds?: number;
    error?: string;
  } | null>(null);

  // Ping test state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    code?: number;
    payload?: any;
  }>({ status: 'idle', message: '' });

  const fetchSessionStatus = async () => {
    try {
      const res = await fetch('/api/session-status');
      const data = await res.json();
      setSessionInfo(data);
    } catch {
      setSessionInfo({ status: 'error', error: 'Gagal mengecek sesi server' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessionStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({
      status: 'idle',
      message: serverTarget === 'localhost' ? 'Menguji server localhost...' : 'Menghubungi server remote...',
    });

    try {
      const resp = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-link',
          email: 'test.localhost@example.com',
          serverTarget,
          customEndpoint,
          apiKey,
        }),
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setTestResult({
          status: 'success',
          code: resp.status,
          message: data.message || 'Koneksi ke server target berhasil!',
          payload: data,
        });
      } else {
        setTestResult({
          status: 'error',
          code: resp.status,
          message: data.message || 'Server merespons status error.',
          payload: data,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Gagal memanggil backend: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
      fetchSessionStatus();
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npm install && npm run dev');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleSave = () => {
    onSave({
      serverTarget,
      customEndpoint,
      apiKey,
      csrfToken,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white neo-border neo-shadow-lg p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-3 border-[#161616]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#ffde59] neo-border flex items-center justify-center font-black">
              <Laptop className="w-4 h-4 text-[#161616]" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                PENGATURAN SERVER &amp; LOCALHOST
              </h2>
              <span className="text-xs font-bold text-neutral-600">
                Jalankan mandiri di Localhost atau hubungkan ke Server Remote
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 neo-border bg-[#ff7676] text-[#161616] flex items-center justify-center font-black neo-btn"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Server Target Selector */}
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider">
            PILIH TARGET SERVER
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setServerTarget('localhost')}
              className={`p-3.5 text-left neo-border font-bold text-xs transition-all ${
                serverTarget === 'localhost'
                  ? 'bg-[#79e28d] neo-shadow-sm ring-2 ring-[#161616]'
                  : 'bg-white hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm mb-1 text-[#161616]">
                <Laptop className="w-4 h-4" />
                <span>SERVER LOCALHOST (Port 3000)</span>
              </div>
              <div className="text-[11px] text-neutral-800 leading-normal">
                Mode mandiri lokal. Link verifikasi dibuat langsung di komputermu tanpa ketergantungan server luar.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setServerTarget('maya327')}
              className={`p-3.5 text-left neo-border font-bold text-xs transition-all ${
                serverTarget === 'maya327'
                  ? 'bg-[#74c9ff] neo-shadow-sm ring-2 ring-[#161616]'
                  : 'bg-white hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm mb-1 text-[#161616]">
                <Globe className="w-4 h-4" />
                <span>REMOTE SERVER (maya327.my.id)</span>
              </div>
              <div className="text-[11px] text-neutral-800 leading-normal">
                Meneruskan permintaan pengiriman &amp; verifikasi ke backend hosting maya327.my.id.
              </div>
            </button>
          </div>
        </div>

        {/* How to run on your own PC Localhost */}
        <div className="mt-5 bg-[#fff7e0] neo-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-[#161616]">
              <Terminal className="w-4 h-4" />
              <span>CARA MENJALANKAN DI KOMPUTER SENDIRI (LOCALHOST)</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCommand}
              className="text-[11px] font-black underline hover:no-underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCmd ? 'Tersalin ✓' : 'Salin Perintah'}</span>
            </button>
          </div>
          <p className="text-xs font-semibold text-neutral-800 leading-relaxed mb-2">
            Jika kamu ingin menjalankan seluruh kode web ini di laptop atau PC milikmu sendiri:
          </p>
          <div className="bg-[#161616] text-[#79e28d] p-2.5 neo-border font-mono text-xs space-y-1">
            <div># 1. Masuk ke folder proyek</div>
            <div>cd alight-premium-tool</div>
            <div># 2. Pasang dependensi &amp; jalankan</div>
            <div>npm install &amp;&amp; npm run dev</div>
            <div className="text-neutral-400"># Buka browser di: http://localhost:3000</div>
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 bg-[#ffde59] neo-border font-black text-xs neo-btn disabled:opacity-60 flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>
              {isTesting
                ? 'MENGUJI KONEKSI…'
                : `⚡ TEST KONEKSI KE ${serverTarget.toUpperCase()} SEKARANG`}
            </span>
          </button>

          {/* Test Result Feedback */}
          {testResult.status !== 'idle' && (
            <div
              className={`mt-3 p-3 neo-border text-xs font-bold ${
                testResult.status === 'success' ? 'bg-[#79e28d]' : 'bg-[#ff7676] text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-black">
                {testResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#161616]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white" />
                )}
                <span>
                  {testResult.status === 'success' ? 'SUKSES' : 'RESPONS ERROR'}{' '}
                  {testResult.code ? `(HTTP ${testResult.code})` : ''}
                </span>
              </div>
              <p className="text-[11px] font-semibold">{testResult.message}</p>
              {testResult.payload && (
                <pre className="mt-1.5 p-1.5 bg-black/10 text-[10px] font-mono overflow-x-auto">
                  {JSON.stringify(testResult.payload, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t-3 border-[#161616] flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white neo-border font-black text-xs neo-btn"
          >
            BATAL
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#79e28d] neo-border font-black text-xs neo-btn shadow-[3px_3px_0_#161616]"
          >
            SIMPAN PENGATURAN ✓
          </button>
        </div>
      </div>
    </div>
  );
}
