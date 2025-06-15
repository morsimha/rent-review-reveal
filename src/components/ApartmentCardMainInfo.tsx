
import React from "react";
import { Phone, Link } from "lucide-react";
import type { Apartment } from "@/types/ApartmentTypes";
import { format, parseISO } from "date-fns";

interface Props {
  apartment: Apartment;
}

const ApartmentCardMainInfo: React.FC<Props> = ({ apartment }) => {
  // Format entry date
  let formattedEntryDate = "";
  if (apartment.entry_date) {
    try {
      const parsed = parseISO(apartment.entry_date);
      formattedEntryDate = format(parsed, "dd/MM");
    } catch {
      formattedEntryDate = apartment.entry_date;
    }
  }

  return (
    <div className="p-4 flex flex-col flex-grow min-h-0">
      <div className="w-full text-right">
        <h3 className="font-bold text-base text-gray-800 line-clamp-1" style={{ minWidth: 0 }}>
          {apartment.title}
        </h3>
      </div>
      {formattedEntryDate && (
        <div className="flex w-full mb-2 mt-1">
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ml-auto" dir="ltr">
            {formattedEntryDate}
          </span>
        </div>
      )}
      {apartment.location && (
        <p className="text-purple-600 text-sm mb-2 font-medium text-right">{apartment.location}</p>
      )}

      <div className="mb-2">
        <p className="text-gray-600 text-sm line-clamp-2 text-right leading-5">{apartment.description}</p>
      </div>

      {(apartment.contact_name || apartment.contact_phone) && (
        <div className="text-sm text-gray-700 mb-2 text-right">
          {apartment.contact_name && <p className="mb-1 text-right">{apartment.contact_name}</p>}
          {apartment.contact_phone && (
            <p className="flex items-center gap-1 justify-end text-right">
              <span>{apartment.contact_phone}</span>
              <Phone className="w-4 h-4" />
            </p>
          )}
        </div>
      )}

      {apartment.apartment_link && (
        <div className="mb-2 text-right">
          <a
            href={apartment.apartment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1 justify-end text-right"
          >
            <span>קישור לדירה</span>
            <Link className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};

export default ApartmentCardMainInfo;
