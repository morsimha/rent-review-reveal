
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Apartment } from "@/types/ApartmentTypes";

interface Props {
  apartment: Apartment;
  onEdit: (apartment: Apartment) => void;
  onDelete: (apartmentId: string) => void;
}

const ApartmentCardActions: React.FC<Props> = ({ apartment, onEdit, onDelete }) => (
  <div className="flex gap-2">
    <Button
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(apartment);
      }}
      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
    >
      <Edit className="w-4 h-4" />
    </Button>
    <Button
      size="sm"
      variant="destructive"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(apartment.id);
      }}
      className="bg-red-500 hover:bg-red-600 h-8 w-8 p-0 shadow-sm"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
);

export default ApartmentCardActions;
