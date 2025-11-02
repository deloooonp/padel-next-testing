import { useState, useEffect, useRef, useCallback } from "react";
import { getFields, getBookingsByDate, supabase } from "@/lib/supabase/booking";

export function usePadelData(defaultDate = null) {
  const todayDefault = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(defaultDate || todayDefault);
  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState("CLOSED");

  const channelRef = useRef(null);
  const pollingRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  // 🧠 Fetch only bookings (fields don't change often)
  const fetchBookings = useCallback(async () => {
    try {
      const bookingData = await getBookingsByDate(selectedDate);
      setBookings(bookingData || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, [selectedDate]);

  // 📊 Fetch fields once on mount
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const fieldData = await getFields();
        setFields(fieldData || []);
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    };
    fetchFields();
  }, []); // Only run once

  // 📆 Initial load of bookings
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchBookings();
      setIsLoading(false);
      isFirstLoadRef.current = false;
    };
    loadInitialData();
  }, [fetchBookings]);

  // 🚀 Supabase Realtime with connection status tracking
  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

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
            fetchBookings();
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime status:", status);
        setRealtimeStatus(status);
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, fetchBookings]);

  // ⏱ Polling fallback - ONLY when realtime is disconnected
  useEffect(() => {
    // Don't poll if:
    // 1. Still on first load
    // 2. Realtime is connected
    // 3. Tab is not visible
    const shouldPoll =
      !isFirstLoadRef.current &&
      realtimeStatus !== "SUBSCRIBED" &&
      document.visibilityState === "visible";

    if (!shouldPoll) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        console.log("⏸ Polling stopped - realtime active or tab hidden");
      }
      return;
    }

    // Start polling only when realtime fails
    if (!pollingRef.current) {
      console.log("▶️ Polling started - realtime unavailable");
      pollingRef.current = setInterval(fetchBookings, 20000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [realtimeStatus, fetchBookings]);

  // 👁 Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁 Tab visible - fetching latest data");
        fetchBookings();
      } else if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        console.log("🙈 Tab hidden - polling paused");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchBookings]);

  return {
    fields,
    bookings,
    selectedDate,
    setSelectedDate,
    isLoading,
    realtimeStatus, // Expose status for debugging/UI feedback
  };
}
