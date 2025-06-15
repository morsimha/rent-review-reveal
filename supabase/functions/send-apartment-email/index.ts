
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApartmentData {
  title: string;
  description?: string;
  price?: number;
  location?: string;
  image_url?: string;
  arnona?: number;
  square_meters?: number;
  floor?: number;
  contact_name?: string;
  contact_phone?: string;
  status?: string;
  entry_date?: string;
  note?: string; // --- הוספנו תמיכה בהערות
  action?: 'added' | 'updated';
  test?: boolean;
}

function formatEmail(apartment: ApartmentData) {
  const actionText = apartment.action === 'updated' ? 'עודכנה דירה' : 'נוספה דירה חדשה';
  const actionEmoji = apartment.action === 'updated' ? '✏️' : '🆕';
  
  return `
    <h2>${actionEmoji} ${actionText}</h2>
    <ul dir="rtl" style="font-size:16px;">
      <li><b>כותרת:</b> ${apartment.title || "אין"}</li>
      <li><b>מחיר:</b> ${apartment.price ? apartment.price + " ₪" : "-"}</li>
      <li><b>שטח (מ"ר):</b> ${apartment.square_meters ?? "-"}</li>
      <li><b>ארנונה:</b> ${apartment.arnona ?? "-"}</li>
      <li><b>קומה:</b> ${apartment.floor ?? "-"}</li>
      <li><b>מיקום:</b> ${apartment.location || "-"}</li>
      <li><b>תאריך כניסה:</b> ${apartment.entry_date ?? "-"}</li>
      <li><b>סטטוס:</b> ${apartment.status || "-"}</li>
      <li><b>שם איש קשר:</b> ${apartment.contact_name ?? "-"}</li>
      <li><b>טלפון:</b> ${apartment.contact_phone ?? "-"}</li>
      <li><b>תיאור:</b> ${apartment.description || "-"}</li>
      <li><b>הערות:</b> ${apartment.note || "-"}</li>
      <li><b>תמונה:</b> ${apartment.image_url ? `<br/><img src="${apartment.image_url}" style="max-width:360px;border-radius:12px;" alt="" />` : "-"}</li>
    </ul>
  `;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    let apartment: ApartmentData = await req.json();

    // Check if it's a test request
    if (apartment.test) {
      apartment = {
        title: "דירה 3.5 חד׳ ברחוב מבוא פודים",
        price: 3400,
        square_meters: 65,
        arnona: 400,
        floor: 3,
        location: "מבוא פודים, ירושלים",
        entry_date: "2025-08-01",
        contact_name: "אבי בעל־הבית",
        contact_phone: "050-0000000",
        description: "דירה מהממת עם נוף פתוח, מרוהטת חלקית, כניסה גמישה.",
        note: "זו הערה שהתווספה לטסט.",
        status: "not_spoke",
        image_url: "",
        action: "added"
      };
    }

    const actionText = apartment.action === 'updated' ? 'עודכנה' : 'נוספה';
    const actionEmoji = apartment.action === 'updated' ? '✏️' : '🆕';

    // שלח תמיד לשני הנמענים
    const recipients = ["moroy9@gmail.com", "elgartgavriela@gmail.com"];

    const result = await resend.emails.send({
      from: "מור וגבי דירות <onboarding@resend.dev>",
      to: recipients,
      subject: `${actionEmoji} ${actionText} דירה במערכת!`,
      html: formatEmail(apartment),
    });

    console.log("sent email result:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending apartment email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});
