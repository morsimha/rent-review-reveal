
import { Card, CardContent } from "@/components/ui/card";
import type { Apartment } from "@/types/ApartmentTypes";
import ApartmentCardImageSection from "./ApartmentCardImageSection";
import ApartmentCardMainInfo from "./ApartmentCardMainInfo";
import ApartmentCardNote from "./ApartmentCardNote";
import ApartmentCardRatings from "./ApartmentCardRatings";
import ApartmentCardActions from "./ApartmentCardActions";

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
        {/* פעולות */}
        {isAuthenticated && (
          <ApartmentCardActions
            apartment={apartment}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ApartmentCard;
