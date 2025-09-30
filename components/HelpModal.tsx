// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import { getHelpResponse } from '../services/geminiService';
import { speakWithElevenLabs, stopCurrentAudio, isElevenLabsAvailable } from '../services/elevenLabsService';
import { ChatMessage, Language, AIResponse, BookingConversationState, BookingData } from '../types';
import Card from './ui/Card';
import QRCode from 'qrcode';

// For Web Speech API compatibility
// This global declaration ensures TypeScript recognizes the SpeechRecognition API,
// which may have vendor prefixes (like webkitSpeechRecognition) in different browsers.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface HelpModalProps {
  isOnline: boolean;
  closeModal: () => void;
  onNavigate: (poiId: string) => void;
  onBooking: () => void;
  onViewHistory?: () => void;
}

const translations = {
  'en-US': {
    initialMessage: "Hello! I'm your AI assistant. How can I help you today at Somnath Temple?",
    title: "AI Help Assistant",
    placeholder: "Ask or tap the mic...",
    quickReplies: [ "Where is the prasad counter?", "Book a darshan slot", "Temple timings?", "SOS" ],
    sosAlert: "Your emergency alert has been sent. Temple authorities have been notified of your location. Please stay calm, help is on the way."
  },
  'hi-IN': {
    initialMessage: "नमस्ते! मैं आपका AI सहायक हूँ। आज मैं सोमनाथ मंदिर में आपकी कैसे मदद कर सकता हूँ?",
    title: "एआई सहायता सहायक",
    placeholder: "पूछें या माइक पर टैप करें...",
    quickReplies: [ "प्रसाद काउंटर कहाँ है?", "दर्शन स्लॉट बुक करें", "मंदिर का समय?", "एसओएस" ],
    sosAlert: "आपका एसओएस अलर्ट भेज दिया गया है। मंदिर अधिकारियों को आपके स्थान की सूचना दे दी गई है। कृपया शांत रहें, मदद रास्ते में है।"
  },
  'gu-IN': {
    initialMessage: "નમસ્તે! હું તમારો AI સહાયક છું। આજે સોમનાથ મંદિરમાં હું તમને કેવી રીતે મદદ કરી શકું?",
    title: "એઆઈ મદદ સહાયક",
    placeholder: "પૂછો અથવા માઇક પર ટેપ કરો...",
    quickReplies: [ "प्रસાદ કાઉન્ટર ક્યાં છે?", "દર્શન સ્લોટ બુક કરો", "મંદિરનો સમય?", "એસઓએસ" ],
    sosAlert: "તમારું એસઓએસ એલર્ટ મોકલવામાં આવ્યું છે। મંદિરના અધિકારીઓને તમારા સ્થાનની જાણ કરવામાં આવી છે। કૃપા કરીને શાંત રહો, મદદ રસ્તામાં છે."
  },
  'ta-IN': {
    initialMessage: "வணக்கம்! நான் உங்கள் AI உதவியாளர். இன்று சோம்நாத் கோவிலில் நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    title: "AI உதவி உதவியாளர்",
    placeholder: "கேளுங்கள் அல்லது மைக்கைத் தட்டவும்...",
    quickReplies: [ "பிரசாத கவுண்ட்டர் எங்கே?", "தர்ஷன் ஸ்லாட் பதிவு செய்யுங்கள்", "கோவில் நேரம்?", "SOS" ],
    sosAlert: "உங்கள் அவசர எச்சரிக்கை அனுப்பப்பட்டது. உங்கள் இருப்பிடம் கோவில் அதிகாரிகளுக்குத் தெரிவிக்கப்பட்டுள்ளது. தயவுசெய்து அமைதியாக இருங்கள், உதவி வந்து கொண்டிருக்கிறது."
  },
  'mr-IN': {
    initialMessage: "नमस्कार! मी तुमचा AI सहाय्यक आहे. आज सोमनाथ मंदिरात मी तुमची कशी मदत करू शकतो?",
    title: "AI मदत सहाय्यक",
    placeholder: "विचारा किंवा माइकवर टॅप करा...",
    quickReplies: [ "प्रसाद काउंटर कुठे आहे?", "दर्शन स्लॉट बुक करा", "मंदिराची वेळ?", "SOS" ],
    sosAlert: "तुमचा एसओएस अलर्ट पाठवला गेला आहे. तुमच्या स्थानाची माहिती मंदिर अधिकाऱ्यांना देण्यात आली आहे. कृपया शांत रहा, मदत येत आहे."
  },
  'or-IN': {
    initialMessage: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର AI ସହାୟକ। ଆଜି ସୋମନାଥ ମନ୍ଦିରରେ ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    title: "AI ସହାୟତା ସହାୟକ",
    placeholder: "ପଚାରନ୍ତୁ କିମ୍ବା ମାଇକ୍ ଟ୍ୟାପ୍ କରନ୍ତୁ...",
    quickReplies: [ "ପ୍ରସାଦ କାଉଣ୍ଟର କେଉଁଠାରେ ଅଛି?", "ଦର୍ଶନ ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ", "ମନ୍ଦିର ସମୟ?", "SOS" ],
    sosAlert: "ଆପଣଙ୍କର SOS ଆଲର୍ଟ ପଠାଯାଇଛି। ଆପଣଙ୍କ ଅବସ୍ଥାନ ବିଷୟରେ ମନ୍ଦିର କର୍ତ୍ତୃପକ୍ଷଙ୍କୁ ସୂଚନା ଦିଆଯାଇଛି। ଦୟାକରି ଶାନ୍ତ ରୁହନ୍ତୁ, ସାହାଯ୍ୟ ଆସୁଛି।"
  },
  'sd-IN': {
    initialMessage: "Namaste! Maan tuhinjo AI sahayak aahiyan. Aj Somnath mandir mein maan tuhinji kidan madad kari saghan tho?",
    title: "AI Madad Sahayak",
    placeholder: "Puchho ya mic te tap kayo...",
    quickReplies: ["Prasad counter kithe aahe?", "Darshan slot book kayo", "Mandir jo time?", "SOS"],
    sosAlert: "Tuhinjo SOS alert moklio wayo aahe. Tuhinji jagah ji jaankari mandir je adhikariyan khe dini wayi aahe. Kripya shant raho, madad achi rahi aahe."
  },
  'kut-IN': {
    initialMessage: "Namaste! Aun tanjo AI sahayak chhu. Aaje Somnath mandir me aun tanji kevi rite madad kari shaku?",
    title: "AI Madad Sahayak",
    placeholder: "Puchho ya mic te tap karo...",
    quickReplies: ["Prasad counter Kete chhe?", "Darshan slot book karo", "Mandir jo time?", "SOS"],
    sosAlert: "Tanjo SOS alert mokli devama aavyo chhe. Tanji jagah ji jaankari mandir je adhikariyo ne dedi chhe. Kripya shant raho, madad aavi rahi chhe."
  }
};

const getInitialLanguage = (): Language => {
  const savedLang = localStorage.getItem('pilgrimPathLanguage');
  if (savedLang === 'en-US' || savedLang === 'hi-IN' || savedLang === 'gu-IN' || savedLang === 'ta-IN' || savedLang === 'mr-IN' || savedLang === 'or-IN' || savedLang === 'sd-IN' || savedLang === 'kut-IN') {
    return savedLang;
  }
  return 'en-US';
};

const HelpModal: React.FC<HelpModalProps> = ({ isOnline, closeModal, onNavigate, onBooking, onViewHistory }) => {
  const [language, setLanguage] = React.useState<Language>(getInitialLanguage);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { role: 'model', content: translations[language].initialMessage }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [micPermission, setMicPermission] = React.useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [recognitionError, setRecognitionError] = React.useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = React.useState<boolean>(true);

  // Booking conversation state
  const [bookingState, setBookingState] = React.useState<BookingConversationState | null>(null);
  const [bookingData, setBookingData] = React.useState<Partial<BookingData> | null>(null);
  const [isBookingConversation, setIsBookingConversation] = React.useState(false);

  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any | null>(null);
  
  // --- Language Persistence ---
  React.useEffect(() => {
    localStorage.setItem('pilgrimPathLanguage', language);
    if (recognitionRef.current) {
        recognitionRef.current.lang = language;
    }
    // Update initial message if conversation hasn't started
    setMessages(prev => {
        if (prev.length === 1 && prev[0].role === 'model') {
            return [{ role: 'model', content: translations[language].initialMessage }];
        }
        return prev;
    });
  }, [language]);


  // --- Check Microphone Permission ---
  const checkMicPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermission(result.state);
      return result.state;
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      setMicPermission('prompt');
      return 'prompt';
    }
  };

  // --- Voice Recognition Setup ---
  // This effect initializes the Web Speech API for voice input. It runs once
  // on component mount and re-initializes if the user changes the language.
  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setRecognitionError('Voice recognition is not supported in this browser. Please use a modern browser like Chrome, Edge, or Safari.');
      return;
    }
    
    setSpeechSupported(true);
    recognitionRef.current = new SpeechRecognition();
    // 'continuous: false' ensures it stops listening after the first phrase.
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = language;
    
    // This event is triggered when speech is successfully recognized.
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setRecognitionError(null);
      sendMessage(transcript); // Automatically send the transcribed message
      setIsListening(false);
    };
    
    // Handles cases where recognition fails (e.g., no speech detected).
    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      let errorMessage = '';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          setMicPermission('denied');
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please enable microphone access in your browser settings.';
          setMicPermission('denied');
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your connection and try again.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not available. Please try again later.';
          break;
        default:
          errorMessage = 'Speech recognition failed. Please try again.';
      }
      setRecognitionError(errorMessage);
    };
    
    // Resets the listening state when the recognition session ends.
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, [language]); // Dependency on language ensures recognition uses the correct language.

  // --- Text-to-Speech with Eleven Labs ---
  const speak = async (text: string) => {
    console.log('🗣️ Speak function called with text:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    console.log('🌐 Current language:', language);

    if (!text) {
      console.warn('⚠️ No text provided to speak function');
      return;
    }

    try {
      await speakWithElevenLabs(text, language);
      console.log('✅ Voice synthesis completed successfully');
    } catch (error) {
      console.error('❌ Voice synthesis failed:', error);
      // Error is already handled in the service with fallback
    }
  };

  // --- Chat Auto-Scrolling and Speech Trigger ---
  // This effect runs whenever a new message is added to the chat.
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    console.log('📨 New message received:', {
      role: lastMessage?.role,
      contentLength: lastMessage?.content?.length,
      isModelMessage: lastMessage?.role === 'model',
      hasContent: !!lastMessage?.content
    });

    // Automatically speak any new response from the AI assistant.
    if (lastMessage && lastMessage.role === 'model' && lastMessage.content) {
      console.log('🎤 Triggering voice for AI response');
      speak(lastMessage.content);
    } else {
      console.log('🔇 Voice not triggered:', {
        hasMessage: !!lastMessage,
        isModel: lastMessage?.role === 'model',
        hasContent: !!lastMessage?.content
      });
    }
    // Ensure the chat view automatically scrolls to the latest message.
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleIntent = (response: AIResponse) => {
    if (response.intent === 'navigate' && response.data?.poiId) {
      setTimeout(() => onNavigate(response.data!.poiId!), 1500);
    } else if (response.intent === 'book') {
      // Start booking conversation instead of navigating
      setIsBookingConversation(true);
      setBookingState('initial');
      setBookingData({});
      // The AI will handle the conversation flow
    } else if (response.intent === 'sos') {
      // SOS is handled automatically in the response text
      console.log('SOS intent detected and handled');
    } else if (response.intent === 'booking_conversation') {
      // Handle booking conversation completion
      if (response.data?.bookingState === 'booking_complete' && response.data?.bookingData) {
        console.log('🎯 Booking completion detected:', response.data);
        console.log('🎯 Booking data received:', response.data.bookingData);
        console.log('🎯 Selected slot:', response.data.bookingData.selectedSlot);
        console.log('🎯 Total members:', response.data.bookingData.totalMembers);
        console.log('🎯 Booking ID:', response.data.bookingData.bookingId);
        // Generate QR code and show booking confirmation
        generateBookingQR(response.data.bookingData);
      } else {
        console.log('📝 Booking conversation update:', response.data?.bookingState);
      }
    }
  };

  const handleSOS = () => {
    if (isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: 'SOS - Emergency Alert' };
    const sosResponse: ChatMessage = { role: 'model', content: translations[language].sosAlert };
      
    setMessages(prev => [...prev, userMessage, sosResponse]);
    setInput('');
  };

  // Generate QR code for completed booking
  const generateBookingQR = async (bookingData: Partial<BookingData>) => {
    console.log('🎫 Starting QR generation for booking:', bookingData);
    console.log('🎫 Selected slot:', bookingData.selectedSlot);
    console.log('🎫 Total members:', bookingData.totalMembers);

    // Validate booking data
    if (!bookingData.selectedSlot || !bookingData.totalMembers) {
      console.error('❌ Invalid booking data:', bookingData);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: 'Sorry, there was an issue with your booking data. Please try booking again.'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    try {
      // Use bookingId from booking data if available, otherwise generate new one
      const bookingId = bookingData.bookingId || `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const qrData = {
        bookingId,
        slot: bookingData.selectedSlot?.time,
        pilgrims: bookingData.totalMembers,
        timestamp: new Date().toISOString()
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
      console.log('📱 QR Code generated:', qrCodeDataURL.substring(0, 50) + '...');

      // Save booking to history
      const bookingHistory = {
        id: bookingId,
        slotId: bookingData.selectedSlot?.id || '',
        slotTime: bookingData.selectedSlot?.time || '',
        pilgrims: bookingData.pilgrims || [],
        totalMembers: bookingData.totalMembers || 0,
        seniorCitizenCount: bookingData.seniorCitizenCount || 0,
        timestamp: Date.now(),
        status: 'confirmed' as const,
        qrCode: qrCodeDataURL
      };

      console.log('💾 Saving booking to history:', bookingHistory);

      // Save to localStorage
      const existingHistory = localStorage.getItem('yatra360_booking_history');
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      historyArray.push(bookingHistory);
      localStorage.setItem('yatra360_booking_history', JSON.stringify(historyArray));

      console.log('✅ Booking saved to localStorage. Total bookings:', historyArray.length);
      console.log('📋 Current localStorage content:', localStorage.getItem('yatra360_booking_history'));

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('bookingHistoryUpdated'));

      const qrMessage: ChatMessage = {
        role: 'model',
        content: language === 'en-US'
          ? `🎉 **Booking Confirmed!**\n\n**Booking ID:** ${bookingId}\n**Time Slot:** ${bookingData.selectedSlot?.time}\n**Group Size:** ${bookingData.totalMembers} people\n\nYour booking has been saved to your history. You can view it anytime in the History section.`
          : language === 'hi-IN'
          ? `🎉 **बुकिंग पुष्टि हुई!**\n\n**बुकिंग आईडी:** ${bookingId}\n**समय स्लॉट:** ${bookingData.selectedSlot?.time}\n**समूह का आकार:** ${bookingData.totalMembers} लोग\n\nआपकी बुकिंग आपके इतिहास में सहेजी गई है। आप इसे कभी भी इतिहास अनुभाग में देख सकते हैं।`
          : `🎉 **બુકિંગ પુષ્ટિ થઈ!**\n\n**બુકિંગ આઈડી:** ${bookingId}\n**સમય સ્લોટ:** ${bookingData.selectedSlot?.time}\n**જૂથનું કદ:** ${bookingData.totalMembers} લોકો\n\nતમારી બુકિંગ તમારા ઇતિહાસમાં સાચવવામાં આવી છે. તમે તેને કોઈપણ સમયે ઇતિહાસ વિભાગમાં જોઈ શકો છો।`
      };

      setMessages(prev => [...prev, qrMessage]);

      // Add QR code image
      setTimeout(() => {
        const qrImageMessage: ChatMessage = {
          role: 'model',
          content: `<img src="${qrCodeDataURL}" alt="Booking QR Code" style="max-width: 200px; margin: 10px auto; display: block;" />`
        };
        setMessages(prev => [...prev, qrImageMessage]);

        // Reset booking state
        setBookingState(null);
        setBookingData(null);
        setIsBookingConversation(false);
        
        // Navigate to history after a delay
        setTimeout(() => {
          if (onViewHistory) {
            onViewHistory();
          }
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Error generating booking QR:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: language === 'en-US'
          ? "Sorry, there was an error generating your booking QR code. Please try booking through the main booking screen."
          : language === 'hi-IN'
          ? "क्षमा करें, आपकी बुकिंग QR कोड जनरेट करने में त्रुटि हुई। कृपया मुख्य बुकिंग स्क्रीन के माध्यम से बुकिंग करने का प्रयास करें।"
          : "માફ કરશો, તમારી બુકિંગ QR કોડ જનરેટ કરવામાં ભૂલ આવી. કૃપા કરીને મુખ્ય બુકિંગ સ્ક્રીન દ્વારા બુકિંગ કરવાનો પ્રયાસ કરો."
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (messageText.trim() === '' || isLoading || !isOnline) return;

    if (messageText.trim().toLowerCase() === 'sos') {
      handleSOS();
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Handle booking conversation or regular response
    const response = isBookingConversation && bookingState
      ? await getHelpResponse(messageText, language, bookingState, bookingData || undefined)
      : await getHelpResponse(messageText, language);

    if (response) {
      const modelMessage: ChatMessage = { role: 'model', content: response.responseText };
      setMessages(prev => [...prev, modelMessage]);

      // Handle booking conversation state updates
      if (response.intent === 'booking_conversation' && response.data?.bookingState) {
        setBookingState(response.data.bookingState);
        setBookingData(response.data.bookingData || null);
        setIsBookingConversation(true);
      } else if (response.intent === 'book') {
        // Start new booking conversation
        console.log('🎫 Starting booking conversation');
        setBookingState('initial');
        setBookingData({
          pilgrims: [],
          seniorCitizenCount: 0,
          totalMembers: 0,
          status: 'pending'
        });
        setIsBookingConversation(true);
        
        // Get the initial booking response
        const bookingResponse = await getHelpResponse(messageText, language, 'initial', {
          pilgrims: [],
          seniorCitizenCount: 0,
          totalMembers: 0,
          status: 'pending'
        });
        
        if (bookingResponse) {
          const bookingMessage: ChatMessage = { role: 'model', content: bookingResponse.responseText };
          setMessages(prev => [...prev, bookingMessage]);
          
          if (bookingResponse.intent === 'booking_conversation' && bookingResponse.data?.bookingState) {
            setBookingState(bookingResponse.data.bookingState);
            setBookingData(bookingResponse.data.bookingData || null);
          }
        }
      } else {
        // Reset booking state for non-booking intents
        setBookingState(null);
        setBookingData(null);
        setIsBookingConversation(false);
      }

      handleIntent(response);
    } else {
      const errorMessage: ChatMessage = { role: 'model', content: "I'm sorry, I couldn't process that. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const handleSend = () => sendMessage(input);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };
  const handleQuickReply = (reply: string) => sendMessage(reply);
  
  // Toggles the microphone on and off for voice input.
  const handleListen = async () => {
    if (!recognitionRef.current) {
      setRecognitionError('Voice recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    // Check microphone permission before starting
    const permission = await checkMicPermission();
    if (permission === 'denied') {
      setRecognitionError('Microphone access is denied. Please enable microphone access in your browser settings.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setRecognitionError(null);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setRecognitionError('Failed to start voice recognition. Please try again.');
    }
  };

  // Cleanup audio when modal closes
  React.useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);
  
  const uiText = translations[language];

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex justify-center items-center p-2 sm:p-4 animate-fade-in">
      <Card className="w-full max-w-sm sm:max-w-md h-full max-h-[95vh] sm:max-h-[700px] flex flex-col p-0">
        <header className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <iconify-icon icon="ph:robot-bold" className="text-lg sm:text-2xl text-orange-500"></iconify-icon>
            <div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{uiText.title}</h3>
              <div className="flex items-center space-x-1 text-xs">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isElevenLabsAvailable() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-gray-500 text-xs">
                  {isElevenLabsAvailable() ? 'Premium Voice' : 'Basic Voice'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
                onClick={handleSOS}
                className="p-1.5 sm:p-2 rounded-full bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 flex items-center justify-center"
                aria-label="Send SOS Emergency Alert"
            >
                <iconify-icon icon="mdi:sos" className="text-lg sm:text-xl text-red-600"></iconify-icon>
            </button>
            <button onClick={closeModal} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500" aria-label="Close help modal">
              <iconify-icon icon="mdi:close" className="text-lg sm:text-xl text-gray-600"></iconify-icon>
            </button>
          </div>
        </header>

        <div className="flex-grow p-2 sm:p-3 space-y-3 sm:space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <iconify-icon icon="ph:robot-bold" className="text-orange-500 text-sm sm:text-lg"></iconify-icon>
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 shadow-sm ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                {msg.content.includes('<img') ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                ) : (
                  <p className="text-xs sm:text-sm whitespace-pre-line">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2 sm:gap-3 justify-start">
               <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                 <iconify-icon icon="ph:robot-bold" className="text-orange-500 text-sm sm:text-lg"></iconify-icon>
               </div>
               <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-bl-none shadow-sm">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="p-2 sm:p-3 border-t border-gray-200 flex-shrink-0">
            {recognitionError && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                    {recognitionError}
                </div>
            )}
            <div className="flex items-center overflow-x-auto space-x-1 sm:space-x-2 mb-2 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {uiText.quickReplies.map(reply => (
                    <button key={reply} onClick={() => handleQuickReply(reply)} className="text-xs text-orange-600 bg-orange-100 rounded-full px-2 sm:px-3 py-1 whitespace-nowrap hover:bg-orange-200 transition-colors disabled:opacity-50" disabled={isLoading || !isOnline}>
                        {reply}
                    </button>
                ))}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isOnline ? uiText.placeholder : "You are offline"}
                        className="w-full border border-gray-300 rounded-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        disabled={isLoading || !isOnline}
                    />
                    <button onClick={handleListen} disabled={!isOnline || isLoading || !speechSupported} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors" aria-label="Use microphone">
                        {isListening ? (
                            <div className="flex items-end space-x-0.5 sm:space-x-1">
                                <div className="w-0.5 sm:w-1 bg-red-500 animate-pulse" style={{height: '3px', animationDelay: '0ms'}}></div>
                                <div className="w-0.5 sm:w-1 bg-red-500 animate-pulse" style={{height: '6px', animationDelay: '150ms'}}></div>
                                <div className="w-0.5 sm:w-1 bg-red-500 animate-pulse" style={{height: '4px', animationDelay: '300ms'}}></div>
                                <div className="w-0.5 sm:w-1 bg-red-500 animate-pulse" style={{height: '8px', animationDelay: '450ms'}}></div>
                                <div className="w-0.5 sm:w-1 bg-red-500 animate-pulse" style={{height: '3px', animationDelay: '600ms'}}></div>
                            </div>
                        ) : (
                            <iconify-icon icon={`mdi:microphone${!speechSupported ? '-off' : ''}`} className={`text-lg sm:text-xl transition-colors ${!speechSupported ? 'text-gray-400' : micPermission === 'denied' ? 'text-red-500' : 'text-gray-500'}`}></iconify-icon>
                        )}
                    </button>
                </div>
                <button onClick={handleSend} disabled={isLoading || !isOnline || input.trim() === ''} className="bg-orange-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 hover:bg-orange-600 transition-colors disabled:bg-gray-300">
                    <iconify-icon icon="mdi:send" className="text-lg sm:text-xl"></iconify-icon>
                </button>
            </div>
            <div className="text-center mt-2 flex items-center justify-center space-x-1 sm:space-x-2">
              <button
                onClick={async () => {
                  console.log('🧪 Testing voice setup...');
                  const { testElevenLabsSetup } = await import('../services/elevenLabsService');
                  await testElevenLabsSetup();
                }}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                title="Test voice synthesis"
              >
                Test Voice
              </button>
              <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="text-xs bg-transparent border-none focus:outline-none text-gray-500 p-1 cursor-pointer">
                <option value="en-US">English</option>
                <option value="hi-IN">हिंदी (Hindi)</option>
                <option value="gu-IN">ગુજરાતી (Gujarati)</option>
                <option value="ta-IN">தமிழ் (Tamil)</option>
                <option value="mr-IN">मराठी (Marathi)</option>
                <option value="or-IN">ଓଡିଆ (Odia)</option>
                <option value="sd-IN">सिन्धी (Sindhi)</option>
                <option value="kut-IN">કચ્છી (Kutchi)</option>
              </select>
            </div>
        </div>
      </Card>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HelpModal;