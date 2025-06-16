import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronLeft, ChevronRight, Mic, Square, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MusicalKeyboardProps {
  bigButtons?: boolean;
}

interface RecordedNote {
  note: string;
  frequency: number;
  timestamp: number;
}

const MusicalKeyboard: React.FC<MusicalKeyboardProps> = ({ bigButtons = false }) => {
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const [octave, setOctave] = useState(4); // אוקטבה 4 כברירת מחדל
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recordingStartTime = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // תווים באוקטבה אחת
  const baseNotes = [
    { name: 'דו', baseFreq: 261.63, emoji: '🎵' },
    { name: 'דו#', baseFreq: 277.18, emoji: '🎵', isBlack: true },
    { name: 'רה', baseFreq: 293.66, emoji: '🎶' },
    { name: 'רה#', baseFreq: 311.13, emoji: '🎶', isBlack: true },
    { name: 'מי', baseFreq: 329.63, emoji: '🎼' },
    { name: 'פה', baseFreq: 349.23, emoji: '🎤' },
    { name: 'פה#', baseFreq: 369.99, emoji: '🎤', isBlack: true },
    { name: 'סול', baseFreq: 392.00, emoji: '🎧' },
    { name: 'סול#', baseFreq: 415.30, emoji: '🎧', isBlack: true },
    { name: 'לה', baseFreq: 440.00, emoji: '🎷' },
    { name: 'לה#', baseFreq: 466.16, emoji: '🎷', isBlack: true },
    { name: 'סי', baseFreq: 493.88, emoji: '🎻' },
  ];

  // חישוב תדר לפי אוקטבה
  const getFrequency = (baseFreq: number, octave: number) => {
    return baseFreq * Math.pow(2, octave - 4);
  };

  const playNote = (baseFreq: number, noteName: string) => {
    const frequency = getFrequency(baseFreq, octave);
    
    // הקלטת התו אם במצב הקלטה
    if (isRecording) {
      const timestamp = Date.now() - recordingStartTime.current;
      setRecordedNotes(prev => [...prev, { note: `${noteName}${octave}`, frequency, timestamp }]);
    }

    try {
      // יצירת AudioContext אם לא קיים
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // צליל ארוך יותר לחוויית נגינה
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.5);
    } catch (error) {
      console.log('Failed to play note:', error);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordedNotes([]);
    recordingStartTime.current = Date.now();
    toast({
      title: "התחלת הקלטה 🎵",
      description: "נגן את המנגינה שלך!",
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast({
      title: "הקלטה הסתיימה",
      description: `הוקלטו ${recordedNotes.length} תווים`,
    });
  };

  const analyzeMelody = async () => {
    if (recordedNotes.length === 0) {
      toast({
        title: "אין מנגינה",
        description: "קודם הקלט מנגינה!",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // הכנת המידע לשליחה
      const melodyData = recordedNotes.map(note => ({
        note: note.note,
        time: note.timestamp / 1000 // המרה לשניות
      }));

      const prompt = `נא לנתח את המנגינה הבאה שנוגנה בפסנתר:
${melodyData.map(n => `${n.note} בזמן ${n.time.toFixed(2)}s`).join(', ')}

האם זו מנגינה מוכרת? אם כן, מה שמה? תן ניתוח קצר של המנגינה.`;

      const { data, error } = await supabase.functions.invoke('analyze-melody', {
        body: { 
          melody: melodyData,
          prompt: prompt 
        }
      });

      if (error) throw error;

      toast({
        title: "ניתוח המנגינה",
        description: data.analysis || "לא הצלחנו לזהות את המנגינה",
      });
    } catch (error) {
      console.error('Error analyzing melody:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לנתח את המנגינה",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const buttonSizeClasses = bigButtons
    ? "text-xl px-3 py-4 min-w-12"
    : "text-sm px-2 py-3 min-w-10";

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* בקרות */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => setOctave(Math.max(1, octave - 1))}
          disabled={octave <= 1}
          size="sm"
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4" />
          אוקטבה נמוכה
        </Button>
        
        <span className="font-semibold text-lg">אוקטבה {octave}</span>
        
        <Button
          onClick={() => setOctave(Math.min(7, octave + 1))}
          disabled={octave >= 7}
          size="sm"
          variant="outline"
        >
          אוקטבה גבוהה
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* פסנתר */}
      <div className="relative">
        <div className="flex gap-0.5 relative">
          {baseNotes.filter(note => !note.isBlack).map((note, index) => (
            <Button
              key={note.name}
              onClick={() => playNote(note.baseFreq, note.name)}
              className={`${themeConfig.buttonGradient} text-black bg-white hover:bg-gray-100 ${buttonSizeClasses} rounded-b-lg border-2 border-gray-300 relative z-10`}
              title={`${note.name}${octave}`}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl">{note.emoji}</span>
                <span className="text-xs mt-1">{note.name}</span>
              </div>
            </Button>
          ))}
        </div>
        
        {/* קלידים שחורים */}
        <div className="absolute top-0 left-0 right-0 flex">
          {baseNotes.filter(note => !note.isBlack).map((note, index) => {
            const blackNote = baseNotes.find(n => n.name === note.name + '#');
            if (blackNote && index < baseNotes.filter(n => !n.isBlack).length - 1) {
              const position = index === 1 ? 'left-[52px]' : 
                              index === 2 ? 'left-[124px]' : 
                              index === 4 ? 'left-[268px]' : 
                              index === 5 ? 'left-[340px]' : 
                              index === 6 ? 'left-[412px]' : '';
              
              return (
                <Button
                  key={blackNote.name}
                  onClick={() => playNote(blackNote.baseFreq, blackNote.name)}
                  className={`absolute ${position} bg-gray-800 hover:bg-gray-700 text-white h-16 w-8 rounded-b-md z-20`}
                  title={`${blackNote.name}${octave}`}
                >
                  <span className="text-xs">{blackNote.name}</span>
                </Button>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* בקרת הקלטה */}
      <div className="flex items-center gap-4 mt-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Mic className="w-4 h-4 mr-2" />
            התחל הקלטה
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-gray-600 hover:bg-gray-700 text-white animate-pulse"
          >
            <Square className="w-4 h-4 mr-2" />
            עצור הקלטה
          </Button>
        )}
        
        <Button
          onClick={analyzeMelody}
          disabled={recordedNotes.length === 0 || isAnalyzing}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'מנתח...' : 'נתח מנגינה'}
        </Button>
      </div>

      {/* מצב הקלטה */}
      {recordedNotes.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          הוקלטו {recordedNotes.length} תווים
        </div>
      )}
    </div>
  );
};

export default MusicalKeyboard;