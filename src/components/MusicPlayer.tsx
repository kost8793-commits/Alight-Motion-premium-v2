import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(35); // 0 - 100
  const [statusText, setStatusText] = useState<string>('Ketuk untuk memutar');
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);

  // Playful upbeat pentatonic / lo-fi melody notes (in Hz)
  const notes = [
    261.63, // C4
    329.63, // E4
    392.00, // G4
    523.25, // C5
    440.00, // A4
    392.00, // G4
    329.63, // E4
    293.66, // D4
    349.23, // F4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    493.88, // B4
    392.00, // G4
    329.63, // E4
    293.66, // D4
  ];

  const bassNotes = [
    130.81, // C3
    130.81,
    110.00, // A2
    110.00,
    87.31,  // F2
    87.31,
    98.00,  // G2
    98.00,
  ];

  const playSynthNote = (ctx: AudioContext, masterGain: GainNode, freq: number, duration: number, isBass = false) => {
    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = isBass ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const peakGain = isBass ? 0.35 : 0.22;
      noteGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(peakGain, ctx.currentTime + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration - 0.02);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio node cleanup
    }
  };

  const scheduleNextStep = () => {
    if (!isPlayingRef.current || !audioCtxRef.current || !gainNodeRef.current) return;

    const ctx = audioCtxRef.current;
    const masterGain = gainNodeRef.current;

    const currentStep = stepRef.current;
    const melodyFreq = notes[currentStep % notes.length];
    const bassFreq = bassNotes[Math.floor((currentStep % 16) / 2) % bassNotes.length];

    // Trigger melodic note
    playSynthNote(ctx, masterGain, melodyFreq, 0.24, false);

    // Trigger subtle rhythmic bass on every 2nd step
    if (currentStep % 2 === 0) {
      playSynthNote(ctx, masterGain, bassFreq, 0.45, true);
    }

    stepRef.current = (currentStep + 1) % 64;
    timerRef.current = window.setTimeout(scheduleNextStep, 240);
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime((volume / 100) * 0.4, ctx.currentTime);
      gain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startMusic = async () => {
    try {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      isPlayingRef.current = true;
      setIsPlaying(true);
      setStatusText('Sedang diputar');
      scheduleNextStep();
    } catch {
      setStatusText('Ketuk layar untuk musik');
    }
  };

  const pauseMusic = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setStatusText('Ketuk untuk memutar');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      startMusic();
    }
  };

  // Update volume gain in real-time
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = (volume / 100) * 0.4;
      gainNodeRef.current.gain.setValueAtTime(targetGain, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-[#161616] text-white p-2.5 sm:p-3 neo-border neo-shadow-sm select-none"
      role="region"
      aria-label="Pemutar musik website"
    >
      {/* Music Icon Badge */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 neo-border bg-[#ffde59] text-[#161616] flex items-center justify-center font-black text-lg transition-transform ${
          isPlaying ? 'animate-bounce' : 'rotate-[-6deg]'
        }`}
        aria-hidden="true"
      >
        <Music className="w-5 h-5 text-[#161616]" />
      </div>

      {/* Details & Status */}
      <div className="flex flex-col min-w-[125px] sm:min-w-[145px] pr-1">
        <span className="text-[11px] sm:text-xs font-black tracking-wider text-[#ffde59] leading-tight">
          MUSIK WEBSITE
        </span>
        <small className="text-[10px] sm:text-[11px] font-bold text-neutral-300 leading-tight">
          {statusText}
        </small>
      </div>

      {/* Volume Popover Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="p-1.5 text-neutral-300 hover:text-white transition-colors"
          title="Atur Volume"
          aria-label="Atur Volume"
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {showVolumeSlider && (
          <div className="absolute bottom-full right-0 mb-3 bg-white text-[#161616] p-2.5 neo-border neo-shadow-sm w-36 flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px] font-black">
              <span>VOLUME</span>
              <span>{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="accent-[#161616] cursor-pointer w-full h-2 bg-neutral-200"
            />
          </div>
        )}
      </div>

      {/* Play / Pause Neo Button */}
      <button
        type="button"
        onClick={toggleMusic}
        className="w-9 h-9 sm:w-10 sm:h-10 neo-border bg-[#79e28d] text-[#161616] flex items-center justify-center font-black hover:bg-[#ffde59] transition-all transform active:scale-95"
        aria-label={isPlaying ? 'Jeda musik' : 'Putar musik'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current stroke-current" />
        ) : (
          <Play className="w-4 h-4 fill-current stroke-current translate-x-0.5" />
        )}
      </button>
    </div>
  );
}
