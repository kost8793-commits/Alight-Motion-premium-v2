import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiConfig, FormStatus } from '../types';

interface SendLinkFormProps {
  apiConfig: ApiConfig;
  onEmailSent: (email: string, magicLink?: string) => void;
  initialEmail?: string;
}

export default function SendLinkForm({
  apiConfig,
  onEmailSent,
  initialEmail = '',
}: SendLinkFormProps) {
  const [email, setEmail] = useState<string>(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<FormStatus>({
    kind: 'idle',
    message: '',
  });

  const emailInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    if (initialEmail && initialEmail !== email) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (isSubmittingRef.current) return;

    // Direct read from DOM ref to prevent any React state / browser autofill delay
    const currentInputValue = emailInputRef.current?.value ?? email;
    const trimmedEmail = currentInputValue.trim();

    if (!trimmedEmail) {
      setStatus({
        kind: 'error',
        message: 'Email akun wajib diisi. Masukkan alamat email akun Alight Motion kamu.',
      });
      emailInputRef.current?.focus();
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setStatus({
        kind: 'error',
        message: 'Format email tidak valid. Pastikan format nama@domain.com.',
      });
      emailInputRef.current?.focus();
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setStatus({
      kind: 'info',
      message: 'Menghubungi server maya327 untuk mengirim link…',
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 28000);

    try {
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          action: 'send-link',
          email: trimmedEmail,
          serverTarget: apiConfig.serverTarget,
          csrf: apiConfig.csrfToken,
          customEndpoint: apiConfig.customEndpoint,
          apiKey: apiConfig.apiKey,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus({
          kind: 'error',
          message: data.message || `Layanan gagal memproses permintaan (HTTP ${response.status}).`,
        });
      } else {
        setStatus({
          kind: 'success',
          message: data.message || `Link masuk sudah siap! Silakan periksa atau lanjutkan ke Langkah 02.`,
        });
        // Auto-transfer email and magic link to Step 2
        onEmailSent(trimmedEmail, data.magicLink);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus({
          kind: 'error',
          message: 'Permintaan timeout (>28 detik). Server maya327 lambat merespons.',
        });
      } else {
        setStatus({
          kind: 'error',
          message: 'Gagal menghubungi server proxy. Periksa sambungan jaringan atau coba lagi.',
        });
      }
    } finally {
      clearTimeout(timer);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#fff7e0] neo-border neo-shadow p-6 sm:p-7 flex flex-col justify-between" aria-labelledby="sendTitle">
      <div>
        {/* Step Badge */}
        <span className="inline-block neo-border bg-[#ff77b7] text-[#161616] px-2.5 py-1 text-xs font-black tracking-wider neo-shadow-sm mb-3">
          LANGKAH 01 / KIRIM LINK
        </span>

        {/* Title & Description */}
        <h2 id="sendTitle" className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2 text-[#161616]">
          Kirim link ke email
        </h2>
        <p className="text-sm sm:text-base font-bold text-neutral-700 mb-5">
          Gunakan alamat email akun yang ingin kamu verifikasi.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider mb-2 text-[#161616]">
              Email akun
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                maxLength={254}
                autoComplete="email"
                inputMode="email"
                required
                className="w-full min-h-[52px] neo-border p-3.5 bg-white text-[#161616] font-semibold text-base outline-none focus:shadow-[4px_4px_0_#161616] transition-shadow placeholder:text-neutral-400"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            </div>
            <small className="block mt-2 text-xs font-bold text-neutral-600">
              Pastikan kamu bisa membuka inbox email tersebut.
            </small>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full min-h-[52px] neo-border bg-[#79e28d] text-[#161616] font-black text-base neo-shadow-sm neo-btn flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait mt-5 active:translate-x-[2px] active:translate-y-[2px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>MEMPROSES…</span>
              </>
            ) : (
              <>
                <span>KIRIM LINK</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Dynamic Status Alert */}
      {status.kind !== 'idle' && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-5 p-3.5 neo-border font-extrabold text-xs sm:text-sm break-words transition-all flex items-start gap-2.5 ${
            status.kind === 'success'
              ? 'bg-[#79e28d] text-[#161616]'
              : status.kind === 'error'
              ? 'bg-[#ff7676] text-white'
              : 'bg-[#74c9ff] text-[#161616]'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#161616]" />
          ) : status.kind === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-white" />
          ) : (
            <Loader2 className="w-5 h-5 shrink-0 animate-spin text-[#161616]" />
          )}
          <span className="leading-snug">{status.message}</span>
        </div>
      )}
    </section>
  );
}
