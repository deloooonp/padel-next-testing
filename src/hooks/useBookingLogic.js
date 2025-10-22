"use client";

import { useState } from "react";
import { createBooking } from "@/lib/supabaseClient";
import { calculateEndTime } from "@/utils/utils";

export function useBookingLogic(selectedDate, refreshBookings) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleConfirmBooking = async (
    field,
    slot,
    duration,
    transaction_id
  ) => {
    const startTime = slot;
    const endTime = calculateEndTime(startTime, duration);

    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      await createBooking({
        field_id: field.id,
        date: selectedDate,
        slot,
        end_slot: endTime,
        total_price: duration * field.price_per_hour,
        transaction_id: transaction_id,
        status: "paid",
      });
      setMessage(
        `✅ Booking untuk ${field.name} pada jam ${slot} hingga ${endTime} berhasil dibuat!`
      );

      await refreshBookings();
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Gagal membuat booking.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    message,
    setMessage,
    handleConfirmBooking, // Mengekspor fungsi konfirmasi yang diminta
  };
}
