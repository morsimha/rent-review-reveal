
import React from "react";

interface Props {
  note?: string | null;
}

const ApartmentCardNote: React.FC<Props> = ({ note }) => (
  <div className="mb-4">
    <p className="text-sm text-gray-600 text-right break-words whitespace-pre-line">
      {note || "אין הערות"}
    </p>
  </div>
);

export default ApartmentCardNote;
