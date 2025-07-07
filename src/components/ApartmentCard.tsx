import { Card, CardContent } from "@/components/ui/card";
import type { Apartment } from "@/types/ApartmentTypes";
import ApartmentCardImageSection from "./ApartmentCardImageSection";
import ApartmentCardMainInfo from "./ApartmentCardMainInfo";
import ApartmentCardNote from "./ApartmentCardNote";
import ApartmentCardRatings from "./ApartmentCardRatings";
import ApartmentCardActions from "./ApartmentCardActions";
import { Brain, Edit, Trash2 } from "lucide-react";
import ApartmentAdviceDialog from "./ApartmentAdviceDialog";
import { useApartmentAdviceDialog } from "./hooks/useApartmentAdviceDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  firstName: string;
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
  firstName,
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

  const adviceDialog = useApartmentAdviceDialog(apartment);

  return (
    <Card
      className="bg-white/90 backdrop-blur-sm border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col cursor-pointer relative"
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
        
        {/* Content with adjusted padding */}
        <div className="px-4 pb-4 flex-1 flex flex-col">
          {/* דירוגים/סטטוס */}
          <ApartmentCardRatings
            apartment={apartment}
            isAuthenticated={isAuthenticated}
            firstName={firstName}
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
          {/* שורה תחתונה עם כפתור "שווה לי?" וכפתורי עריכה/מחיקה */}
          <div className="flex flex-row items-center pb-2 mt-auto">
            {/* Edit button on the left */}
            {isAuthenticated && (
              <Button
                size="sm"
                variant="outline"
                onClick={e => {
                  e.stopPropagation();
                  onEdit(apartment);
                }}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {/* Centered advice button */}
            <div className="flex-1 flex justify-center">
              <button
                type="button"
                className="flex items-center gap-2 border rounded px-3 py-1 text-sm font-semibold text-purple-700 border-purple-300 bg-purple-50 hover:bg-purple-100 transition"
                onClick={adviceDialog.openDialog}
              >
                <Brain size={18} className="text-purple-500"/>
                שווה לי? 🧠
              </button>
            </div>
            {/* Delete button on the right */}
            {isAuthenticated && (
              <Button
                size="sm"
                variant="destructive"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(apartment.id);
                }}
                className="bg-red-500 hover:bg-red-600 h-8 w-8 p-0 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      {/* דיאלוג ייעוץ + בדיחה */}
      <ApartmentAdviceDialog
        open={adviceDialog.open}
        onOpenChange={adviceDialog.setOpen}
        loading={adviceDialog.adviceLoading}
        advice={adviceDialog.advice}
        error={adviceDialog.adviceError}
        onRetry={adviceDialog.onRetry}
        joke={adviceDialog.joke}
        jokeLoading={adviceDialog.jokeLoading}
        jokeError={adviceDialog.jokeError}
      />
    </Card>
  );
};

export default ApartmentCard;
