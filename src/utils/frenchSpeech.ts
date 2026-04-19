/** Web Speech API: prefer an actual French voice; lang alone often falls back to English on Windows/Chrome. */

let voicesReadyPromise: Promise<void> | null = null;

export function preloadFrenchVoices(): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve();
  }
  if (voicesReadyPromise) return voicesReadyPromise;

  voicesReadyPromise = new Promise<void>((resolve) => {
    const synth = window.speechSynthesis;
    const done = () => resolve();
    if (synth.getVoices().length > 0) {
      done();
      return;
    }
    synth.addEventListener('voiceschanged', done, { once: true });
    window.setTimeout(done, 750);
  });

  return voicesReadyPromise;
}

function scoreFrenchVoice(v: SpeechSynthesisVoice): number {
  const lang = (v.lang || '').toLowerCase();
  let score = 0;
  if (lang === 'fr-fr') score += 100;
  else if (lang.startsWith('fr')) score += 80;
  else if (/french/i.test(v.name)) score += 60;
  if (/france|paris/i.test(v.name)) score += 15;
  if (v.localService) score += 5;
  return score;
}

export function pickFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  if (!voices.length) return undefined;
  const ranked = [...voices].sort((a, b) => scoreFrenchVoice(b) - scoreFrenchVoice(a));
  const best = ranked[0];
  return scoreFrenchVoice(best) > 0 ? best : undefined;
}

export function speakFrench(text: string, opts?: { rate?: number }): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'fr-FR';
  utter.rate = opts?.rate ?? 0.88;

  const voices = synth.getVoices();
  const fr = pickFrenchVoice(voices);
  if (fr) utter.voice = fr;

  synth.speak(utter);
}

export async function speakFrenchWhenReady(text: string, opts?: { rate?: number }): Promise<void> {
  await preloadFrenchVoices();
  speakFrench(text, opts);
}
