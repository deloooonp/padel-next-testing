"use client";

import React, { useState, useEffect } from "react";
import { createBooking } from "../lib/supabaseClient";
import BookingModal from "../components/BookingModal";
import { calculateEndTime, generateSlots, isSlotBooked } from "@/utils/utils";
import { usePadelData } from "@/hooks/usePadelData";

const slots = generateSlots();

export default function PadelPrototype() {
  const { fields, bookings, selectedDate, setSelectedDate, refreshBookings } =
    usePadelData();

  // State yang berhubungan dengan UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_CLIENT;

    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSelectSlot = (field, slot) => {
    setModalData({ field, slot });
  };

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
      setModalData(null);
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Gagal membuat booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Padel Booking — Supabase Connected
          </h1>
        </header>

        <section className="mb-6 bg-gray-800 p-4 rounded-2xl shadow-sm">
          <label className="block text-sm font-medium text-gray-200">
            Pilih tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-2 p-2 border border-gray-600 bg-gray-900 text-white rounded w-48"
          />
        </section>

        {message && (
          <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
            {message}
          </div>
        )}

        <section className="grid gap-4">
          {fields.map((field) => (
            <article
              key={field.id}
              className="bg-gray-800 p-4 rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white">
                    {field.name}
                  </h2>
                  <div className="text-sm text-gray-400">
                    Rp {field.price_per_hour.toLocaleString()} / jam
                  </div>
                </div>
                <button
                  className="px-3 py-1 bg-gray-700 text-white rounded cursor-pointer"
                  onClick={() =>
                    alert(`Menampilkan detail untuk ${field.name}`)
                  }
                >
                  Detail
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {slots.map((s) => {
                  const booked = isSlotBooked(
                    bookings,
                    field.id,
                    selectedDate,
                    s.value
                  );
                  return (
                    <button
                      key={s.value}
                      onClick={() => handleSelectSlot(field, s.value)}
                      className={`text-sm p-2 rounded transition-colors duration-150 ${
                        booked
                          ? "bg-red-700 text-white cursor-not-allowed"
                          : "bg-green-700 hover:bg-green-600 text-white active:bg-green-700 focus:outline-2 focus:outline-offset-2 focus:outline-green-500"
                      }`}
                      disabled={booked || loading}
                    >
                      {booked ? "Booked" : s.label}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      </div>

      {modalData && (
        <BookingModal
          field={modalData.field}
          slot={modalData.slot}
          onClose={() => setModalData(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </main>
  );
}
