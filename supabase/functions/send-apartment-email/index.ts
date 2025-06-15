
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
}

function formatEmail(apartment: ApartmentData) {
  return `
    <h2>🆕 נוספה דירה חדשה</h2>
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
      <li><b>תמונה:</b> ${apartment.image_url ? `<br/><img src="${apartment.image_url}" style="max-width:360px;border-radius:12px;" alt="" />` : "-"}</li>
    </ul>
  `;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const apartment: ApartmentData = await req.json();

    const result = await resend.emails.send({
      from: "מור וגבי דירות <onboarding@resend.dev>",
      to: "moroy9@gmail.com",
      subject: "🆕 נוספה דירה חדשה במערכת!",
      html: formatEmail(apartment),
    });

    console.log("sent email result:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Error sending apartment email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
