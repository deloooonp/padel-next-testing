import { useState, useEffect, useRef, useCallback } from "react";
import { getFields, getBookingsByDate, supabase } from "@/lib/supabaseClient";

export function usePadelData(defaultDate = null) {
  const todayDefault = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(defaultDate || todayDefault);
  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const channelRef = useRef(null);
  const pollingRef = useRef(null);

  // 🧠 Stable fetchData pakai useCallback biar referensinya tetap
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (fields.length === 0) {
        const fieldData = await getFields();
        setFields(fieldData || []);
      }

      const bookingData = await getBookingsByDate(selectedDate);
      setBookings(bookingData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, fields.length]);

  // 📆 Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🚀 Supabase Realtime
  useEffect(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          const { new: newData, old: oldData } = payload;
          if (
            newData?.date === selectedDate ||
            oldData?.date === selectedDate
          ) {
            console.log("🔥 Realtime update:", payload.eventType);
            fetchData();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, fetchData]);

  // ⏱ Polling fallback (aktif cuma kalau realtime gak aktif)
  useEffect(() => {
    const startPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(fetchData, 20000);
      console.log("▶️ Polling started");
    };

    const stopPolling = () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log("⏸ Polling stopped");
    };

    // Aktif hanya jika tab visible
    if (document.visibilityState === "visible") startPolling();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") startPolling();
      else stopPolling();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData]);

  return { fields, bookings, selectedDate, setSelectedDate, isLoading };
}
