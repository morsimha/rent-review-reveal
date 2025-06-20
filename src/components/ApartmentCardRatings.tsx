
import React from "react";
import StarRating from "./StarRating";
import { Checkbox } from "@/components/ui/checkbox";
import type { Apartment } from "@/types/ApartmentTypes";

interface Props {
  apartment: Apartment;
  isAuthenticated: boolean;
  onMorRatingChange: (apartmentId: string, rating: number) => void;
  onGabiRatingChange: (apartmentId: string, rating: number) => void;
  onMorTalkedChange?: (apartmentId: string, value: boolean) => void;
  onGabiTalkedChange?: (apartmentId: string, value: boolean) => void;
}

const ApartmentCardRatings: React.FC<Props> = ({
  apartment,
  isAuthenticated,
  onMorRatingChange,
  onGabiRatingChange,
  onMorTalkedChange,
  onGabiTalkedChange,
}) => (
  <div className="mb-3 space-y-2">
    <div className="flex flex-row items-center gap-2 justify-start text-right">
      <div className="flex items-center gap-1">
        <Checkbox
          checked={!!apartment.spoke_with_mor}
          onCheckedChange={(value) => onMorTalkedChange?.(apartment.id, !!value)}
          aria-label="מור דיבר עם בעל הדירה"
          className="accent-purple-600"
          disabled={!isAuthenticated}
        />
      </div>
      <span className="text-sm font-medium text-purple-600">מור:</span>
      <StarRating
        rating={apartment.mor_rating || 0}
        onRatingChange={(rating) => onMorRatingChange(apartment.id, rating)}
      />
    </div>
    <div className="flex flex-row items-center gap-2 justify-start text-right">
      <div className="flex items-center gap-1">
        <Checkbox
          checked={!!apartment.spoke_with_gabi}
          onCheckedChange={(value) => onGabiTalkedChange?.(apartment.id, !!value)}
          aria-label="גבי דיבר עם בעל הדירה"
          className="accent-pink-600"
          disabled={!isAuthenticated}
        />
      </div>
      <span className="text-sm font-medium text-pink-600">גבי:</span>
      <StarRating
        rating={apartment.gabi_rating || 0}
        onRatingChange={(rating) => onGabiRatingChange(apartment.id, rating)}
      />
    </div>
  </div>
);

export default ApartmentCardRatings;
