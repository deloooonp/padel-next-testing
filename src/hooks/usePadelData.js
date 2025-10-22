"use client";

import { useState, useEffect } from "react";
import { getFields, getBookingsByDate } from "@/lib/supabaseClient";

export function usePadelData() {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);

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

  // Effect untuk memanggil fetchData setiap kali selectedDate berubah
  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Fungsi untuk me-refresh data booking secara manual (dipanggil setelah booking berhasil)
  const refreshBookings = async () => {
    const bookingData = await getBookingsByDate(selectedDate);
    setBookings(bookingData || []);
  };

  return {
    fields,
    bookings,
    selectedDate,
    setSelectedDate,
    refreshBookings,
  };
}
