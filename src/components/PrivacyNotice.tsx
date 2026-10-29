import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface PrivacyNoticeProps {
  consentChecked: boolean;
  onConsentChange: (checked: boolean) => void;
  isHighlighted?: boolean;
}

export default function PrivacyNotice({
  consentChecked,
  onConsentChange,
  isHighlighted = false,
}: PrivacyNoticeProps) {
  return (
    <aside
      className={`bg-white neo-border p-5 sm:p-6 mb-8 transition-all ${
        isHighlighted
          ? 'ring-4 ring-[#ff7676] bg-[#fff0f0] neo-shadow-lg'
          : 'neo-shadow'
      }`}
      aria-labelledby="privacyTitle"
    >
      <div className="flex items-start gap-3 mb-2.5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#ffde59] neo-border flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-[#161616]" />
        </div>
        <h3 id="privacyTitle" className="text-lg sm:text-xl font-black tracking-tight text-[#161616]">
          Penting sebelum mengirim link
        </h3>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-neutral-700 leading-relaxed pl-0 sm:pl-11">
        Link masuk dari email dapat memberi akses ke akunmu. Halaman ini meneruskan email dan link
        yang kamu masukkan ke layanan API eksternal untuk diproses. Jangan gunakan jika kamu tidak
        mempercayai penyedia layanan tersebut. Situs ini tidak menyimpan email atau link di database.
      </p>

      <div className="mt-4 pt-3.5 border-t-2 border-[#161616] pl-0 sm:pl-11">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            id="consent"
            checked={consentChecked}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="w-5 h-5 min-w-[20px] neo-border mt-0.5 accent-[#161616] cursor-pointer"
          />
          <span className="text-xs sm:text-sm font-black text-[#161616] group-hover:text-neutral-800 leading-snug">
            Saya memahami risiko berbagi link masuk dan setuju mengirimkannya ke layanan eksternal.
          </span>
        </label>
      </div>
    </aside>
  );
}
