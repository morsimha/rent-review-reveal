import React from "react";
import { House } from "lucide-react";
import type { Apartment } from "@/types/ApartmentTypes";

interface Props {
  apartment: Apartment;
}

const ApartmentCardImageSection: React.FC<Props> = ({ apartment }) => (
  <div className="relative overflow-hidden flex-shrink-0 h-48">
    <img
      src={
        apartment.image_url ||
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
      }
      alt={apartment.title}
      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110 rounded-tr-lg"
    />
    <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
      {apartment.price && (
        <div className="bg-green-500 text-white px-2 py-1 rounded-full font-bold text-sm flex items-center gap-1">
          <span>{apartment.price}₪</span>
        </div>
      )}
      {apartment.arnona != null && !isNaN(Number(apartment.arnona)) && (
        <div className="bg-yellow-400 text-black px-2 py-1 rounded-full font-bold text-sm" title="ארנונה" style={{ textAlign: 'left', alignSelf: 'flex-start' }}>
          {apartment.arnona}₪
        </div>
      )}
      {apartment.pets_allowed === 'yes' && <div className="text-xl" title="מותר בעלי חיים">🐱</div>}
    </div>
    <div className="absolute top-2 left-2 z-10 flex flex-col items-end gap-1">
      {apartment.has_shelter && (
        <div className="bg-white/70 rounded px-2 py-1 flex items-center gap-1 shadow" style={{ textAlign: 'right' }}>
          <span className="text-xs text-purple-800">מקלט</span>
          <House className="w-5 h-5 text-purple-800" />
        </div>
      )}
      {apartment.floor != null && (
        <div className="bg-white/70 rounded px-2 py-1 flex items-center gap-1 shadow text-purple-800 text-xs" style={{ textAlign: 'right' }}>
          <span>קומה </span>
          <span className="font-bold">{apartment.floor}</span>
        </div>
      )}
      {apartment.square_meters != null && (
        <div className="bg-white/70 rounded px-2 py-1 flex items-center gap-1 shadow text-purple-800 text-xs" style={{ textAlign: 'right' }}>
          <span className="font-bold">{apartment.square_meters}</span>
          <span>מ"ר </span>
        </div>
      )}
    </div>
  </div>
);

export default ApartmentCardImageSection;
