// Eleven Labs Text-to-Speech Service
// Provides realistic female voice assistant for multiple languages

// Vite environment variables type declaration
declare global {
  interface ImportMetaEnv {
    readonly VITE_ELEVENLABS_API_KEY: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

// Vite environment variables type declaration
interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Voice IDs for different languages (Eleven Labs)
// Using real voice IDs that support multiple languages
const VOICE_IDS = {
  'en-US': '21m00Tcm4TlvDq8ikWAM', // Rachel (English) - Clear and professional female voice
  'hi-IN': '21m00Tcm4TlvDq8ikWAM', // Rachel can handle Hindi well
  'gu-IN': '21m00Tcm4TlvDq8ikWAM', // Rachel for Gujarati
  'ta-IN': '29vD34q81wCH69ZR5z7Q', // Drew - Natural Tamil voice, excellent for South Indian languages
  'mr-IN': '21m00Tcm4TlvDq8ikWAM', // Rachel for Marathi
  'or-IN': '21m00Tcm4TlvDq8ikWAM', // Rachel for Odia
  'sd-IN': '21m00Tcm4TlvDq8ikWAM', // Rachel for Sindhi
  'kut-IN': '21m00Tcm4TlvDq8ikWAM'  // Rachel for Kutchi
};

// Alternative voices for better language support
const ALTERNATIVE_VOICES = {
  'hi-IN': 'AZnzlk1XvdvUeBnXmlld', // Hindi-optimized voice if available
  'ta-IN': 'TX3LPaxmHKxFdv7VOQHJ', // Tamil voice if available
  'gu-IN': 'IKne3meq5aSn9XLyUdCD'  // Gujarati voice if available
};

// Fallback voice for unsupported languages
const FALLBACK_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - reliable English voice

export const speakWithElevenLabs = async (text: string, language: string): Promise<void> => {
  console.log('🎤 Voice requested for:', language, 'Text length:', text.length);

  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    console.log('🔑 API Key available:', !!apiKey, apiKey ? 'Yes' : 'No (using fallback)');

    if (!apiKey || apiKey === 'YOUR_ELEVEN_LABS_API_KEY_HERE') {
      console.warn('⚠️ Eleven Labs API key not configured, using browser TTS fallback');
      fallbackToBrowserTTS(text, language);
      return;
    }

    // Try language-specific voice first, then fallback
    let voiceId = VOICE_IDS[language as keyof typeof VOICE_IDS] ||
                  ALTERNATIVE_VOICES[language as keyof typeof ALTERNATIVE_VOICES] ||
                  FALLBACK_VOICE_ID;

    console.log(`🎵 Using Eleven Labs voice for ${language}: ${voiceId}`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    console.log('📡 API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Eleven Labs API error:', response.status, errorText);
      throw new Error(`Eleven Labs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    console.log('🎧 Audio blob size:', audioBlob.size, 'bytes');

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Stop any currently playing audio
    stopCurrentAudio();

    // Store reference to current audio for cleanup
    (window as any).currentElevenLabsAudio = audio;

    console.log('▶️ Starting audio playback...');

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        console.log('✅ Audio playback completed');
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (error) => {
        console.error('❌ Audio playback failed:', error);
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      audio.play().then(() => {
        console.log('🎵 Audio started playing successfully');
      }).catch((error) => {
        console.error('❌ Audio play failed:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error('💥 Eleven Labs TTS failed:', error);
    // Fallback to browser TTS if Eleven Labs fails
    console.log('🔄 Falling back to browser TTS...');
    fallbackToBrowserTTS(text, language);
  }
};

export const stopCurrentAudio = (): void => {
  const currentAudio = (window as any).currentElevenLabsAudio;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    // Don't revoke URL here as it might still be playing
  }

  // Also stop browser speech synthesis as backup
  if (typeof window.speechSynthesis !== 'undefined') {
    window.speechSynthesis.cancel();
  }
};

// Fallback to browser TTS if Eleven Labs fails
const fallbackToBrowserTTS = (text: string, language: string): void => {
  console.log('🔄 Using browser TTS fallback for language:', language);

  if (typeof window.speechSynthesis === 'undefined') {
    console.error('❌ Browser TTS not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.pitch = 1.1;
  utterance.rate = 0.85; // Slightly slower for better understanding
  utterance.volume = 0.9;

  console.log('🎵 Browser TTS utterance created:', {
    lang: utterance.lang,
    pitch: utterance.pitch,
    rate: utterance.rate,
    volume: utterance.volume
  });

  // Enhanced voice selection for better language support
  const voices = window.speechSynthesis.getVoices();
  console.log('🎤 Available voices:', voices.length);

  const languageCode = language.split('-')[0];

  // Priority order for voice selection
  const voicePreferences = [
    // Exact language match with female voice
    () => voices.find(voice =>
      voice.lang === language &&
      (voice.name.toLowerCase().includes('female') ||
       voice.name.toLowerCase().includes('woman') ||
       voice.name.toLowerCase().includes('girl'))
    ),
    // Language family match with female voice
    () => voices.find(voice =>
      voice.lang.startsWith(languageCode) &&
      (voice.name.toLowerCase().includes('female') ||
       voice.name.toLowerCase().includes('woman') ||
       voice.name.toLowerCase().includes('girl'))
    ),
    // Any female voice for the language
    () => voices.find(voice =>
      voice.lang.startsWith(languageCode)
    ),
    // Google voices (usually better quality)
    () => voices.find(voice =>
      voice.name.includes('Google') &&
      voice.lang.startsWith(languageCode)
    ),
    // Any voice for the language
    () => voices.find(voice => voice.lang.startsWith(languageCode)),
    // English fallback for unsupported languages
    () => voices.find(voice =>
      voice.lang.startsWith('en') &&
      (voice.name.toLowerCase().includes('female') ||
       voice.name.toLowerCase().includes('woman'))
    )
  ];

  // Try each preference in order
  for (const getVoice of voicePreferences) {
    const selectedVoice = getVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('✅ Selected voice:', selectedVoice.name, 'for lang:', selectedVoice.lang);
      break;
    }
  }

  if (!utterance.voice) {
    console.warn('⚠️ No suitable voice found, using browser default');
  }

  // Add event listeners for debugging
  utterance.onstart = () => console.log('▶️ Browser TTS started');
  utterance.onend = () => console.log('✅ Browser TTS completed');
  utterance.onerror = (event) => console.error('❌ Browser TTS error:', event.error);

  try {
    window.speechSynthesis.speak(utterance);
    console.log('🎵 Browser TTS speak() called successfully');
  } catch (error) {
    console.error('💥 Browser TTS speak() failed:', error);
  }
};

// Check if Eleven Labs is available
export const isElevenLabsAvailable = (): boolean => {
  return !!import.meta.env.VITE_ELEVENLABS_API_KEY;
};

// Get available voices info for debugging
export const getVoiceInfo = (language: string) => {
  const voiceId = VOICE_IDS[language as keyof typeof VOICE_IDS] ||
                  ALTERNATIVE_VOICES[language as keyof typeof ALTERNATIVE_VOICES] ||
                  FALLBACK_VOICE_ID;
  const isFallback = voiceId === FALLBACK_VOICE_ID;
  const hasAlternative = ALTERNATIVE_VOICES[language as keyof typeof ALTERNATIVE_VOICES] !== undefined;

  return {
    voiceId,
    language,
    isFallback,
    hasAlternative,
    provider: isElevenLabsAvailable() ? 'elevenlabs' : 'browser'
  };
};

// Test function to verify Eleven Labs setup
export const testElevenLabsSetup = async (): Promise<boolean> => {
  console.log('🧪 Testing Eleven Labs setup...');

  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  console.log('🔑 API Key present:', !!apiKey);

  if (!apiKey) {
    console.error('❌ No Eleven Labs API key found');
    return false;
  }

  try {
    // Test with a simple English phrase
    const testText = "Hello, this is a test.";
    const testLanguage = "en-US";

    console.log('🧪 Testing voice synthesis with:', testText);
    await speakWithElevenLabs(testText, testLanguage);
    console.log('✅ Eleven Labs test successful');
    return true;
  } catch (error) {
    console.error('❌ Eleven Labs test failed:', error);
    console.log('🔄 Testing browser TTS fallback...');
    fallbackToBrowserTTS("Hello, this is a test using browser TTS.", "en-US");
    return false;
  }
};