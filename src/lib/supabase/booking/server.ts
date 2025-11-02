"use server";

import { createClient } from "../server";

interface CreateBookingProps {
  field_id: number;
  date: string;
  slot: string;
  end_slot: string;
  status: string;
  total_price: number;
  transaction_id?: string;
}

export async function createBooking({
  field_id,
  date,
  slot,
  end_slot,
  status,
  total_price,
  transaction_id,
}: CreateBookingProps) {
  const supabase = await createClient();
  const order_id = `BOOKING-${Date.now()}-${field_id}`;
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // 🔎 Cek apakah slot sudah dibooking
  const { data: existing, error: existingError } = await supabase
    .from("bookings")
    .select("id, status, expires_at")
    .eq("field_id", field_id)
    .eq("date", date)
    .eq("slot", slot)
    .in("status", ["pending", "paid"]);

  if (existingError) {
    console.error("❌ Error checking existing booking:", existingError);
    throw new Error("Gagal memeriksa ketersediaan slot.");
  }

  if (existing && existing.length > 0) {
    console.warn("⚠️ Slot sudah dibooking oleh user lain:", existing);
    return {
      data: null,
      error: null,
      message:
        "⚠️ Slot ini sudah dibooking oleh user lain. Coba pilih slot lain.",
    };
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert([
      {
        field_id,
        date,
        slot,
        end_slot,
        status,
        total_price,
        transaction_id,
        order_id,
        expires_at,
      },
    ])
    .select("*");

  if (error) {
    console.error("❌ createBooking error:", error);
    throw new Error(error.message);
  }

  console.log("✅ Booking created:", data);
  return { data, error };
}

// 🔄 Update status booking
export async function updateBookingStatus(
  order_id: string,
  status: string,
  transaction_id?: string,
  payment_method?: string,
  expiry_time?: string
) {
  const supabase = await createClient();
  console.log("🟡 Updating booking:", {
    order_id,
    status,
    transaction_id,
    expiry_time,
  });
  const updateData: Record<string, any> = { status };
  if (transaction_id) updateData.transaction_id = transaction_id;
  if (payment_method) updateData.payment_method = payment_method;

  if (status === "pending" && transaction_id && expiry_time) {
    updateData.expires_at = new Date(expiry_time).toISOString();
  }

  if (["paid", "cancelled"].includes(status)) {
    updateData.expires_at = null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("order_id", order_id)
    .select("*");

  if (error) {
    console.error("❌ updateBookingStatus error:", error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    console.warn(
      `⚠️ No rows updated — kemungkinan order_id (${order_id}) gak ketemu`
    );
  }

  console.log("✅ Booking updated:", data);
  return data;
}

// FALLBACK JIKA MIDTRANS GA NGIRIM EXPIRY_TIME
// function getPaymentExpiry(payment_method?: string) {
//   const now = new Date();

//   switch (payment_method) {
//     case "bank_transfer":
//     case "echannel": // Mandiri Bill
//       return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 jam
//     case "qris":
//     case "gopay":
//     case "shopeepay":
//     case "credit_card":
//       return new Date(now.getTime() + 5 * 60 * 1000); // 5 menit
//     default:
//       return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 24 jam
//   }
// }
