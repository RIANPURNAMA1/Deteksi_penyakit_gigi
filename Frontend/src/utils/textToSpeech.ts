import type { DetectionDetail } from "./detectionApi";


export const speakDiagnosis = (mainDiagnosis: DetectionDetail | null) => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  synth.cancel();

  const utterance = mainDiagnosis
    ? new SpeechSynthesisUtterance(
        `The primary diagnosis result is ${mainDiagnosis.label}, with a confidence level of ${(mainDiagnosis.value * 100).toFixed(2)} percent.`
      )
    : new SpeechSynthesisUtterance("The diagnosis result is clean teeth. No disease detected.");

  const englishVoice = voices.find(
    (voice) =>
      voice.lang === "en-US" &&
      (voice.name.includes("Google") || voice.name.toLowerCase().includes("english"))
  );
  if (englishVoice) utterance.voice = englishVoice;
  else utterance.lang = "en-US";

  synth.speak(utterance);
};
