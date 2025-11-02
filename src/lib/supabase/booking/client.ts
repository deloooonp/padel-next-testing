import { createClient } from "../client";

export const supabase = createClient();

export async function getFields() {
  const { data, error } = await supabase.from("fields").select("*");

  if (error) throw new Error(`getFields error: ${error.message}`);
  return data;
}

// 📅 Ambil booking berdasarkan tanggal
export async function getBookingsByDate(date: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("date", date);

  if (error) throw new Error(`getBookingsByDate error: ${error.message}`);
  return data;
}

export async function getBookingStatus(order_id: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("status")
    .eq("order_id", order_id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.status;
}
