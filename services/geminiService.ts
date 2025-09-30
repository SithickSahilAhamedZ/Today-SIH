import { GoogleGenAI, Type } from "@google/genai";
import { ForecastData, Language, AIResponse, BookingConversationState, BookingData, DarshanSlot } from '../types';

// Fix: Initialize GoogleGenAI directly with process.env.API_KEY and remove unnecessary checks as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const predictWaitingTime = async (crowdLevel: number, timeOfDay: string): Promise<string | null> => {
  try {
    const prompt = `You are a temple crowd management expert. Based on the current crowd level of ${crowdLevel} out of 10 and it being ${timeOfDay} at a major Indian pilgrimage site, predict the approximate waiting time for darshan. Provide the answer as a range in minutes (e.g., '45-60'). Respond only with the range.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      // Fix: Removed `maxOutputTokens` and set `thinkingBudget: 0` for this low-latency task to comply with `gemini-2.5-flash` model guidelines.
      config: {
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    return response.text.replace('minutes', '').trim() || '45-60';
  } catch (error) {
    console.error("Error predicting waiting time:", error);
    return null; // Return null on error for graceful handling
  }
};


export const generateSafetyAlert = async (situation: string): Promise<string | null> => {
    try {
        const prompt = `
        Generate a concise, clear, and calming safety alert for pilgrims at a temple for the following situation: "${situation}".
        Provide the alert in three languages: English, Hindi (in Roman script), and Gujarati (in Roman script).
        Format each language with a title. Example:
        **English:** [Alert Message]
        **Hindi:** [Alert Message]
        **Gujarati:** [Alert Message]
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
          }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating safety alert:", error);
        return null; // Return null on error
    }
};

export const getForecastSummary = async (forecast: ForecastData[]): Promise<string | null> => {
  try {
    const prompt = `You are a temple operations expert advising pilgrims. Based on this 7-day visitor forecast data (where level 10 is max): ${JSON.stringify(forecast)}, write a brief 1-2 sentence summary. Highlight the busiest days (e.g., weekend, festivals) and give helpful advice. Example: "Expect high traffic this weekend, with a major surge on on Wednesday for the Full Moon festival. Plan accordingly."`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating forecast summary:", error);
    return null; // Return null on error
  }
};

const getLanguageName = (langCode: Language) => {
  switch (langCode) {
    case 'hi-IN': return 'Hindi';
    case 'gu-IN': return 'Gujarati';
    case 'ta-IN': return 'Tamil';
    case 'mr-IN': return 'Marathi';
    case 'or-IN': return 'Odia';
    case 'sd-IN': return 'Sindhi';
    case 'kut-IN': return 'Kutchi';
    default: return 'English';
  }
}

// Generate available darshan slots
const generateAvailableSlots = (): DarshanSlot[] => {
  const slots: DarshanSlot[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  for (let i = 8; i <= 20; i++) {
    if (i === 13 || i === 14) continue; // Lunch break
    const time = `${i.toString().padStart(2, '0')}:00 - ${(i + 1).toString().padStart(2, '0')}:00`;
    const isPast = i < currentHour;

    let availability: 'Available' | 'Full' | 'Filling Fast' = 'Available';
    if(isPast) {
      availability = 'Full';
    } else {
      const random = Math.random();
      if (random < 0.3) availability = 'Full';
      else if (random < 0.6) availability = 'Filling Fast';
    }

    slots.push({
      id: `slot-${i}`,
      time,
      availability,
      booked: false,
    });
  }
  return slots;
};

// Generate booking conversation response
const generateBookingConversationResponse = (
  query: string,
  language: Language,
  currentBookingState?: BookingConversationState,
  currentBookingData?: Partial<BookingData>
): AIResponse => {
  const availableSlots = generateAvailableSlots();
  const langName = getLanguageName(language);

  // Initial booking request
  if (!currentBookingState || currentBookingState === 'initial') {
    const availableTimes = availableSlots
      .filter(slot => slot.availability === 'Available')
      .map(slot => slot.time)
      .slice(0, 5); // Show first 5 available slots

    const responseText = language === 'en-US'
      ? `I'd be happy to help you book a darshan slot! Here are some available times today:\n${availableTimes.map(time => `• ${time}`).join('\n')}\n\nWhat time would you prefer for your darshan?`
      : language === 'hi-IN'
      ? `मैं आपकी दर्शन स्लॉट बुक करने में मदद करूंगा! आज ये समय उपलब्ध हैं:\n${availableTimes.map(time => `• ${time}`).join('\n')}\n\nआप दर्शन के लिए कौन सा समय पसंद करेंगे?`
      : `હું તમને દર્શન સ્લોટ બુક કરવામાં મદદ કરીશ! આજે આ સમય ઉપલબ્ધ છે:\n${availableTimes.map(time => `• ${time}`).join('\n')}\n\nતમે દર્શન માટે કયો સમય પસંદ કરશો?`;

    return {
      intent: 'booking_conversation',
      responseText,
      data: {
        bookingState: 'ask_time',
        bookingData: {
          pilgrims: [],
          seniorCitizenCount: 0,
          totalMembers: 0,
          status: 'pending'
        }
      }
    };
  }

  // Handle time selection
  if (currentBookingState === 'ask_time') {
    // More flexible time matching
    const timePatterns = [
      /(\d{1,2}):(\d{2})/,  // 10:00
      /(\d{1,2})\s*(am|pm|AM|PM)/,  // 10 am
      /(\d{1,2})/  // just 10
    ];

    let selectedSlot = null;
    for (const pattern of timePatterns) {
      const match = query.match(pattern);
      if (match) {
        const hour = parseInt(match[1]);
        // Look for slots that start with this hour
        selectedSlot = availableSlots.find(slot => {
          const slotHour = parseInt(slot.time.split(':')[0]);
          return slotHour === hour && slot.availability === 'Available';
        });
        if (selectedSlot) break;
      }
    }

    // If no exact match, try to find any available slot mentioned
    if (!selectedSlot) {
      selectedSlot = availableSlots.find(slot =>
        query.toLowerCase().includes(slot.time.toLowerCase().split(' - ')[0]) ||
        query.toLowerCase().includes(slot.time.toLowerCase())
      );
    }

    if (selectedSlot && selectedSlot.availability === 'Available') {
      const responseText = language === 'en-US'
        ? `Great! I've selected the ${selectedSlot.time} slot for you. Now I need some details for the booking.\n\nHow many people are in your group? (Including yourself)`
        : language === 'hi-IN'
        ? `बेहतरीन! मैंने आपके लिए ${selectedSlot.time} स्लॉट चुना है। अब मुझे बुकिंग के लिए कुछ विवरण चाहिए।\n\nआपके समूह में कितने लोग हैं? (खुद को मिलाकर)`
        : `સરસ! મેં તમારા માટે ${selectedSlot.time} સ્લોટ પસંદ કર્યો છે. હવે મને બુકિંગ માટે કેટલાક વિગતો જોઈએ.\n\nતમારા જૂથમાં કેટલા લોકો છે? (સ્વયંને સમાવીને)`;

      return {
        intent: 'booking_conversation',
        responseText,
        data: {
          bookingState: 'ask_details',
          bookingData: {
            ...currentBookingData,
            selectedSlot,
            pilgrims: [],
            seniorCitizenCount: 0,
            totalMembers: 0,
            status: 'pending'
          }
        }
      };
    } else {
      // Show available slots again
      const availableTimes = availableSlots
        .filter(slot => slot.availability === 'Available')
        .map(slot => slot.time);

      const responseText = language === 'en-US'
        ? `I couldn't find that time slot. Here are the currently available times:\n${availableTimes.map(time => `• ${time}`).join('\n')}\n\nWhich time would you prefer?`
        : language === 'hi-IN'
        ? `मुझे वह समय स्लॉट नहीं मिला। ये समय अभी उपलब्ध हैं:\n${availableTimes.map(time => `• ${time}`).join('\n')}\n\nआप कौन सा समय पसंद करेंगे?`
        : `મને તે સમય સ્લોટ મળ્યો નથી. અહીં હાલમાં ઉપલબ્ધ સમય છે:\n${availableTimes.map(time => `• ${time}`).join('\n')}\n\nતમે કયો સમય પસંદ કરશો?`;

      return {
        intent: 'booking_conversation',
        responseText,
        data: {
          bookingState: 'ask_time',
          bookingData: currentBookingData
        }
      };
    }
  }

  // Handle member count and details collection
  if (currentBookingState === 'ask_details') {
    // More flexible member count parsing
    const numberWords: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
      '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
    };

    let memberCount = 0;
    
    // Try to find a number word or digit
    const lowerQuery = query.toLowerCase();
    for (const [word, num] of Object.entries(numberWords)) {
      if (lowerQuery.includes(word)) {
        memberCount = num;
        break;
      }
    }

    // Also try regex as fallback
    if (memberCount === 0) {
      const memberMatch = query.match(/(\d+)/);
      memberCount = memberMatch ? parseInt(memberMatch[1]) : 0;
    }

    if (memberCount > 0 && memberCount <= 10) {
      // Immediately complete the booking for simplicity
      const responseText = language === 'en-US'
        ? `Perfect! I've booked a darshan slot for ${memberCount} people. I'm generating your QR code now...`
        : language === 'hi-IN'
        ? `सही! मैंने ${memberCount} लोगों के लिए दर्शन स्लॉट बुक कर दिया है। मैं अभी आपका QR कोड जनरेट कर रहा हूं...`
        : `પરફેક્ટ! મેં ${memberCount} લોકો માટે દર્શન સ્લોટ બુક કરી દીધું છે. હું હમણાં તમારો QR કોડ જનરેટ કરી રહ્યો છું...`;

      console.log('✅ Booking completion in geminiService:', {
        memberCount,
        currentBookingData,
        bookingId: `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      });

      return {
        intent: 'booking_conversation',
        responseText,
        data: {
          bookingState: 'booking_complete',
          bookingData: {
            ...currentBookingData,
            totalMembers: memberCount,
            pilgrims: [],
            seniorCitizenCount: 0,
            status: 'confirmed',
            bookingId: `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
          }
        }
      };
    } else {
      const responseText = language === 'en-US'
        ? `I need to know how many people are in your group. Please tell me a number between 1 and 10.`
        : language === 'hi-IN'
        ? `मुझे जानना है कि आपके समूह में कितने लोग हैं। कृपया 1 से 10 के बीच एक संख्या बताएं।`
        : `મને જાણવું છે કે તમારા જૂથમાં કેટલા લોકો છે. કૃપા કરીને 1 થી 10 વચ્ચે એક સંખ્યા જણાવો.`;

      return {
        intent: 'booking_conversation',
        responseText,
        data: {
          bookingState: 'ask_details',
          bookingData: currentBookingData
        }
      };
    }
  }

  // Default fallback
  return {
    intent: 'booking_conversation',
    responseText: language === 'en-US'
      ? "I'm here to help you book a darshan slot. What time would you prefer?"
      : language === 'hi-IN'
      ? "मैं आपकी दर्शन स्लॉट बुक करने में मदद करने के लिए यहां हूं। आप कौन सा समय पसंद करेंगे?"
      : "હું તમને દર્શન સ્લોટ બુક કરવામાં મદદ કરવા માટે અહીં છું. તમે કયો સમય પસંદ કરશો?",
    data: {
      bookingState: 'ask_time',
      bookingData: {
        pilgrims: [],
        seniorCitizenCount: 0,
        totalMembers: 0,
        status: 'pending'
      }
    }
  };
};

export const getHelpResponse = async (
  query: string,
  language: Language,
  currentBookingState?: BookingConversationState,
  currentBookingData?: Partial<BookingData>
): Promise<AIResponse | null> => {
  try {
    const langName = getLanguageName(language);

    // Check if this is part of a booking conversation
    if (currentBookingState && currentBookingState !== 'initial') {
      return generateBookingConversationResponse(query, language, currentBookingState, currentBookingData);
    }

    // Check for SOS keywords
    const sosKeywords = ['sos', 'emergency', 'help me', 'accident', 'medical', 'police', 'fire'];
    const isSOS = sosKeywords.some(keyword =>
      query.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isSOS) {
      return {
        intent: 'sos',
        responseText: language === 'en-US'
          ? "Emergency alert activated! Temple authorities have been notified of your location. Please stay calm, help is on the way."
          : language === 'hi-IN'
          ? "आपातकालीन अलर्ट सक्रिय! मंदिर अधिकारियों को आपके स्थान की सूचना दे दी गई है। कृपया शांत रहें, मदद रास्ते में है।"
          : "કટોકટી ચેતવણી સક્રિય! મંદિર અધિકારીઓને તમારા સ્થાનની જાણ કરવામાં આવી છે. કૃપા કરીને શાંત રહો, મદદ રસ્તામાં છે.",
        data: {}
      };
    }

    const systemInstruction = `You are a friendly and helpful AI assistant for the Pilgrim Path app, designed for pilgrims at the Somnath Temple in Gujarat.

    **Strict Rules:**
    1. Your entire output MUST be a single, valid JSON object and nothing else. Do not add any text before or after the JSON.
    2. The 'responseText' field MUST be in the requested language: ${langName}.
    3. All other fields ('intent', 'poiId') MUST remain in English. Do not translate the 'intent' or 'poiId' values.

    **Available Points of Interest (POIs) for navigation and their IDs:**
    - Main Temple (Darshan): 'temple'
    - Prasad Counter: 'prasad'
    - Cloak Room & Shoe Stand: 'cloak'
    - First Aid Center: 'firstaid'
    - Main Entrance (Gate 1): 'entrance'

    **Intent Analysis:**
    Analyze the user's query and determine their intent:
    1.  'navigate': User wants directions (e.g., "Where is the prasad counter?").
    2.  'book': User wants to book a darshan slot (e.g., "Book a ticket", "I want to book darshan").
    3.  'sos': User expresses distress or asks for emergency help (e.g., "Help me", "Emergency").
    4.  'answer': For all other general questions.

    **Booking Instructions:**
    If the user wants to book a darshan slot, set intent to 'book'. The system will handle the conversational booking flow separately.

    **Example for a Hindi query:**
    - User Query: "मुझे प्रसाद काउंटर कहाँ मिलेगा?"
    - Expected JSON Output:
      {
        "intent": "navigate",
        "responseText": "ज़रूर, मैं आपको नक्शे पर प्रसाद काउंटर का रास्ता दिखाता हूँ।",
        "data": {
          "poiId": "prasad"
        }
      }

    Now, analyze the user's request and respond.`;
    
    // FIX: Added responseMimeType and responseSchema to ensure reliable JSON output from the model, as per API guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: "The user's intent. Must be one of: 'navigate', 'book', 'sos', 'answer'."
            },
            responseText: {
              type: Type.STRING,
              description: `The response to the user in ${langName}.`
            },
            data: {
              type: Type.OBJECT,
              properties: {
                poiId: {
                  type: Type.STRING,
                  description: "The Point of Interest ID for navigation, if applicable. E.g., 'temple', 'prasad'."
                }
              }
            }
          },
          required: ['intent', 'responseText']
        }
      }
    });

    let jsonText = response.text.trim();
    // The model might wrap the JSON in markdown backticks, so we strip them for robust parsing.
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }

    return JSON.parse(jsonText) as AIResponse;
  } catch (error) {
    console.error("Error getting help response:", error);
    const errorResponse: AIResponse = {
        intent: 'answer',
        responseText: "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please check your connection and try again in a moment."
    };
    return errorResponse;
  }
};