"use client";

import { useState, useEffect } from "react";
import { createBooking } from "@/lib/supabase/booking";
import { calculateEndTime } from "@/utils/utils";

export function useBookingLogic(selectedDate) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage("");
    }, 10000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleConfirmBooking = async (field, slot, duration) => {
    const startTime = slot;
    const endTime = calculateEndTime(startTime, duration);

    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const result = await createBooking({
        field_id: field.id,
        date: selectedDate,
        slot,
        end_slot: endTime,
        total_price: duration * field.price_per_hour,
        status: "pending",
      });

      if (result?.message) {
        setMessage(result.message);
        return null;
      }

      return result.data?.[0] || null;
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Gagal membuat booking.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    message,
    setMessage,
    handleConfirmBooking,
  };
}
