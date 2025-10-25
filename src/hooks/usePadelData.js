import { useState, useEffect, useRef } from "react";
import { getFields, getBookingsByDate, supabase } from "@/lib/supabaseClient";

export function usePadelData() {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);
  const channelRef = useRef(null);

  const fetchData = async () => {
    try {
      if (fields.length === 0) {
        const fieldData = await getFields();
        setFields(fieldData || []);
      }
      const bookingData = await getBookingsByDate(selectedDate);
      setBookings(bookingData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // ⏱ Polling fallback biar aman
  useEffect(() => {
    let interval;

    const startPolling = () => {
      console.log("▶️ Start polling every 15s...");
      clearInterval(interval); // pastikan gak numpuk
      interval = setInterval(fetchData, 15000);
    };

    const stopPolling = () => {
      console.log("⏸ Stop polling");
      clearInterval(interval);
    };

    if (document.visibilityState === "visible") startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") startPolling();
      else stopPolling();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [selectedDate]);

  // 🚀 REALTIME LISTENER SUPABASE
  useEffect(() => {
    // hapus channel lama kalau ada
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // bisa INSERT | UPDATE | DELETE
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          console.log("🔥 Realtime event:", payload.eventType, payload.new);
          // Refresh data kalo tanggalnya sama
          if (
            payload.new?.date === selectedDate ||
            payload.old?.date === selectedDate
          ) {
            fetchData();
          }
        }
      )
      .subscribe((status) => console.log("📡 Channel status:", status));

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  return {
    fields,
    bookings,
    selectedDate,
    setSelectedDate,
  };
}
