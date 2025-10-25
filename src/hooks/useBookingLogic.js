"use client";

import { useState } from "react";
import { createBooking, updateBookingStatus } from "@/lib/supabaseClient";
import { calculateEndTime } from "@/utils/utils";

export function useBookingLogic(selectedDate, refreshBookings) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleConfirmBooking = async (field, slot, duration) => {
    const startTime = slot;
    const endTime = calculateEndTime(startTime, duration);

    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await createBooking({
        field_id: field.id,
        date: selectedDate,
        slot,
        end_slot: endTime,
        total_price: duration * field.price_per_hour,
        transaction_id: null,
        status: "pending",
      });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Gagal membuat booking.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (bookingId, transaction_id) => {
    try {
      await updateBookingStatus(bookingId, "paid", transaction_id);
      if (typeof refreshBookings === "function") await refreshBookings();
      setMessage("✅ Pembayaran berhasil!");
    } catch (error) {
      console.error("Update booking status error:", error);
      setMessage("❌ Gagal memperbarui status booking.");
    }
  };

  return {
    loading,
    message,
    setMessage,
    handleConfirmBooking,
    handlePaymentSuccess,
  };
}
