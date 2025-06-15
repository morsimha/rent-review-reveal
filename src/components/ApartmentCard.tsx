import { Card, CardContent } from "@/components/ui/card";
import type { Apartment } from "@/types/ApartmentTypes";
import ApartmentCardImageSection from "./ApartmentCardImageSection";
import ApartmentCardMainInfo from "./ApartmentCardMainInfo";
import ApartmentCardNote from "./ApartmentCardNote";
import ApartmentCardRatings from "./ApartmentCardRatings";
import ApartmentCardActions from "./ApartmentCardActions";
import { Brain } from "lucide-react";
import ApartmentAdviceDialog from "./ApartmentAdviceDialog";
import { useState } from "react";

interface ApartmentCardProps {
  apartment: Apartment;
  onEdit: (apartment: Apartment) => void;
  onDelete: (apartmentId: string) => void;
  onMorRatingChange: (apartmentId: string, rating: number) => void;
  onGabiRatingChange: (apartmentId: string, rating: number) => void;
  onMorTalkedChange?: (apartmentId: string, value: boolean) => void;
  onGabiTalkedChange?: (apartmentId: string, value: boolean) => void;
  isAuthenticated: boolean;
  onCardClick?: () => void;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  onEdit,
  onDelete,
  onMorRatingChange,
  onGabiRatingChange,
  onMorTalkedChange,
  onGabiTalkedChange,
  isAuthenticated,
  onCardClick,
}) => {
  const getStatusColor = (status: "spoke" | "not_spoke" | "no_answer") => {
    switch (status) {
      case "spoke":
        return "bg-green-400";
      case "not_spoke":
        return "bg-yellow-400";
      case "no_answer":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  // state+logic לייעוץ GPT
  const [isAdviceOpen, setAdviceOpen] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [adviceError, setAdviceError] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  // עדכון fetchAdvice לפי הדרישה שלך
  const fetchAdvice = async () => {
    setAdviceError(null);
    setAdvice(null);
    setAdviceLoading(true);
    try {
      // שימוש ב-URL המלא ו-Authorization header
      const res = await fetch(
        "https://afcdqglyehygiareaoot.supabase.co/functions/v1/gpt-apartment-advisor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmY2RxZ2x5ZWh5Z2lhcmVhb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQyNjgsImV4cCI6MjA2NTQ5MDI2OH0.F2Ljk7v3WkXnuAZ2Vt4VUQKEuP_ZWTeTt7rVTTFGTI8"}`
          },
          body: JSON.stringify({ apartment }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("GPT Advisor error:", errorData);
        setAdviceError(`שגיאה: ${errorData.error || res.statusText}`);
        return;
      }

      const data = await res.json();
      if (data.advice) {
        setAdvice(data.advice);
      } else {
        setAdviceError("לא התקבלה תשובה מהמערכת. נסה שוב מאוחר יותר.");
      }
    } catch (e: any) {
      console.error("Error fetching advice:", e);
      setAdviceError("שגיאה בחיבור ל-GPT. נסה שוב בעוד רגע.");
    } finally {
      setAdviceLoading(false);
    }
  };

  return (
    <Card
      className="bg-white/90 backdrop-blur-sm border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col cursor-pointer"
      onClick={onCardClick}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Status Bar */}
        <div
          className={`h-2 w-full rounded-t-lg ${getStatusColor(apartment.status)}`}
        ></div>
        {/* Image and prices */}
        <ApartmentCardImageSection apartment={apartment} />
        {/* Info */}
        <ApartmentCardMainInfo apartment={apartment} />
        {/* דירוגים/סטטוס */}
        <ApartmentCardRatings
          apartment={apartment}
          isAuthenticated={isAuthenticated}
          onMorRatingChange={onMorRatingChange}
          onGabiRatingChange={onGabiRatingChange}
          onMorTalkedChange={onMorTalkedChange}
          onGabiTalkedChange={onGabiTalkedChange}
        />
        {/* הערות + שורה חדשה לתאריך ביקור */}
        <ApartmentCardNote
          note={apartment.note}
          scheduled_visit_text={apartment.scheduled_visit_text}
        />
        {/* כפתור "שווה לי?" */}
        <div className="flex flex-row justify-center pb-2 mt-1">
          <button
            type="button"
            className="flex items-center gap-2 border rounded px-3 py-1 text-sm font-semibold text-purple-700 border-purple-300 bg-purple-50 hover:bg-purple-100 transition"
            onClick={e => {
              e.stopPropagation();
              setAdviceOpen(true);
              setAdvice(null);
              fetchAdvice();
            }}
          >
            <Brain size={18} className="text-purple-500"/>
            שווה לי? 🧠
          </button>
        </div>
        {/* פעולות */}
        {isAuthenticated && (
          <ApartmentCardActions
            apartment={apartment}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </CardContent>
      {/* דיאלוג לייעוץ GPT */}
      <ApartmentAdviceDialog
        open={isAdviceOpen}
        onOpenChange={setAdviceOpen}
        loading={adviceLoading}
        advice={advice}
        error={adviceError}
        onRetry={fetchAdvice}
      />
    </Card>
  );
};

export default ApartmentCard;
