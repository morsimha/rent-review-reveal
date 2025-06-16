import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight, Mic, Square, Send, Piano, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecordedNote {
  note: string;
  frequency: number;
  timestamp: number;
}

type SoundType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface AdvancedPianoProps {
  onMelodyAnalysis?: (analysis: string) => void;
}

const AdvancedPiano: React.FC<AdvancedPianoProps> = ({ onMelodyAnalysis }) => {
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [octave, setOctave] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [hasVoiceRecording, setHasVoiceRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [soundType, setSoundType] = useState<SoundType>('sine');
  const recordingStartTime = useRef<number>(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const voiceRecordingData = useRef<Blob | null>(null);

  // תווים פשוטים - רק הלבנים
  const notes = [
    { name: 'דו', baseFreq: 261.63, emoji: '🎵' },
    { name: 'רה', baseFreq: 293.66, emoji: '🎶' },
    { name: 'מי', baseFreq: 329.63, emoji: '🎼' },
    { name: 'פה', baseFreq: 349.23, emoji: '🎤' },
    { name: 'סול', baseFreq: 392.00, emoji: '🎧' },
    { name: 'לה', baseFreq: 440.00, emoji: '🎸' },
    { name: 'סי', baseFreq: 493.88, emoji: '🎺' },
    { name: 'דו', baseFreq: 523.25, emoji: '🎹' }
  ];

  const soundTypes = [
    { value: 'sine', label: 'פסנתר קלאסי', emoji: '🎹' },
    { value: 'square', label: 'סינתיסייזר', emoji: '🎛️' },
    { value: 'sawtooth', label: 'כינור חשמלי', emoji: '🎻' },
    { value: 'triangle', label: 'חליל', emoji: '🎺' }
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
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = soundType;
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.2);
      
      setTimeout(() => {
        audioContext.close();
      }, 1300);
    } catch (error) {
      console.log('Failed to play note:', error);
    }
  };

  const startPianoRecording = () => {
    setIsRecording(true);
    setRecordedNotes([]);
    recordingStartTime.current = Date.now();
    toast({
      title: "התחלת הקלטת פסנתר 🎹",
      description: "נגן את המנגינה שלך!",
    });
  };

  const stopPianoRecording = () => {
    setIsRecording(false);
    toast({
      title: "הקלטת פסנתר הסתיימה",
      description: `הוקלטו ${recordedNotes.length} תווים`,
    });
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        voiceRecordingData.current = audioBlob;
        setHasVoiceRecording(true);
      };

      mediaRecorder.current.start();
      setIsVoiceRecording(true);
      
      toast({
        title: "התחלת הקלטת קול 🎤",
        description: "שיר או נשרוק את המנגינה!",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לגשת למיקרופון",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder.current && isVoiceRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsVoiceRecording(false);
      
      toast({
        title: "הקלטת קול הסתיימה",
        description: "ההקלטה מוכנה לניתוח!",
      });
    }
  };

  const analyzeMelody = async () => {
    if (recordedNotes.length === 0 && !hasVoiceRecording) {
      toast({
        title: "אין מנגינה",
        description: "קודם הקלט מנגינה בפסנתר או בקול!",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      let result;
      
      if (hasVoiceRecording && voiceRecordingData.current) {
        // ניתוח הקלטת קול
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          const { data, error } = await supabase.functions.invoke('analyze-melody', {
            body: { 
              audioData: base64Audio,
              prompt: "נא לנתח את המנגינה שנשרקה או נושרה. זהה את התווים והמנגינה אם היא מוכרת."
            }
          });

          if (error) throw error;
          
          const analysis = data.analysis || "לא הצלחנו לזהות את המנגינה";
          if (onMelodyAnalysis) {
            onMelodyAnalysis(analysis);
          }
          
          toast({
            title: "ניתוח הקלטת קול הושלם",
            description: "התוצאה מוצגת למעלה!",
          });
        };
        reader.readAsDataURL(voiceRecordingData.current);
      } else {
        // ניתוח הקלטת פסנתר
        const melodyData = recordedNotes.map(note => ({
          note: note.note,
          time: note.timestamp / 1000
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

        const analysis = data.analysis || "לא הצלחנו לזהות את המנגינה";
        if (onMelodyAnalysis) {
          onMelodyAnalysis(analysis);
        }
        
        toast({
          title: "ניתוח המנגינה הושלם",
          description: "התוצאה מוצגת למעלה!",
        });
      }
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

  // responsive styles
  const getButtonSize = () => isMobile ? "text-lg px-2 py-3 min-w-8 min-h-10" : "text-2xl px-4 py-2 min-w-12 min-h-12";
  const getControlSize = () => isMobile ? "text-xs px-2 py-1" : "text-sm px-3 py-2";

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-full overflow-hidden">
      {/* בקרות אוקטבה וסוג צליל */}
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setOctave(Math.max(1, octave - 1))}
            disabled={octave <= 1}
            size="sm"
            variant="outline"
            className={`h-8 ${isMobile ? 'px-2' : 'px-3'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className={`font-medium ${isMobile ? 'text-xs px-2' : 'text-sm px-3'}`}>
