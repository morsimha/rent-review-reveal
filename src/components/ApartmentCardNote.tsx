
import React from "react";
import type { Apartment } from "@/types/ApartmentTypes";

interface Props {
  note?: string | null;
  scheduled_visit_text?: string | null;
}

const ApartmentCardNote: React.FC<Props> = ({ note, scheduled_visit_text }) => (
  <div className="mb-4 text-right space-y-1">
    {scheduled_visit_text && (
      <div className="text-xs text-purple-800 bg-purple-100 rounded px-2 py-1 font-semibold inline-block">
        קבענו לראות ב: {scheduled_visit_text}
      </div>
    )}
    <p className="text-sm text-gray-600 break-words whitespace-pre-line">
      {note || "אין הערות"}
    </p>
  </div>
);

export default ApartmentCardNote;
