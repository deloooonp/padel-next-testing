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
  const { data, error } = await supabase.from("bookings").insert([
    {
      field_id,
      date,
      slot,
      end_slot,
      status,
      total_price,
      transaction_id,
    },
  ]);
  console.log("RAW insert result:", { data, error });

  if (error) {
    console.error(
      "Full Supabase error dump:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );
    throw error;
  }
  return data;
}
