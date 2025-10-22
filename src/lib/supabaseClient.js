import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Ambil semua lapangan
export async function getFields() {
  const { data, error } = await supabase.from("fields").select("*");
  if (error) throw new Error(error.message);
  return data;
}

// Ambil booking berdasarkan tanggal
export async function getBookingsByDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("date", date);
  if (error) throw new Error(error.message);
  return data;
}

// Buat booking baru
export async function createBooking({
  field_id,
  date,
  slot,
  end_slot,
  status,
  total_price,
  transaction_id,
}) {
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
      },
    ])
    .select();
  console.log("RAW insert result:", { data, error });
  ``;
  if (error) {
    console.error(
      "Full Supabase error dump:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    throw error;
  }
  return { data, error };
}

export async function updateBookingStatus(id, status, transaction_id) {
  console.log("🟡 RUNNING updateBookingStatus:", {
    id,
    status,
    transaction_id,
  });

  const query = supabase
    .from("bookings")
    .update({ status, transaction_id })
    .eq("id", id)
    .select("*");

  console.log("🟢 RAW QUERY OBJECT:", query);

  const { data, error } = await query;

  console.log("🔵 SUPABASE RESPONSE:", { data, error });

  if (error) {
    console.error("❌ SUPABASE UPDATE ERROR:", error);
    throw new Error(error.message || "Unknown Supabase error");
  }

  if (!data || data.length === 0) {
    console.warn(
      "⚠️ No rows updated — kemungkinan id tidak cocok atau RLS aktif"
    );
  }

  console.log("✅ SUPABASE UPDATE SUCCESS:", data);
  return data;
}
