"use client";

import React, { useState, useEffect } from "react";
import BookingModal from "@/components/BookingModal";
import { generateSlots, isSlotBooked } from "@/utils/utils";
import { usePadelData } from "@/hooks/usePadelData";
import { useBookingLogic } from "@/hooks/useBookingLogic";

const slots = generateSlots();

export default function PadelPrototype() {
  const { fields, bookings, selectedDate, setSelectedDate } = usePadelData();

  const { loading, message, setMessage, handleConfirmBooking } =
    useBookingLogic(selectedDate);

  // State yang berhubungan dengan UI
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
                    s.value,
                    ["paid"]
                  );
                  const pending = isSlotBooked(
                    bookings,
                    field.id,
                    selectedDate,
                    s.value,
                    ["pending"]
                  );

                  let buttonStyle = "";
                  let label = s.label;

                  if (booked) {
                    buttonStyle = "bg-red-700 text-white cursor-not-allowed";
                    label = "Booked";
                  } else if (pending) {
                    buttonStyle = "bg-yellow-600 text-white cursor-not-allowed";
                    label = "Pending";
                  } else {
                    buttonStyle =
                      "bg-green-700 hover:bg-green-600 text-white active:bg-green-700 focus:outline-2 focus:outline-offset-2 focus:outline-green-500";
                  }

                  return (
                    <button
                      key={s.value}
                      onClick={() => handleSelectSlot(field, s.value)}
                      className={`text-sm p-2 rounded transition-colors duration-150 ${buttonStyle}`}
                      disabled={booked || pending || loading}
                    >
                      {label}
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
          selectedDate={selectedDate}
          onClose={() => setModalData(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </main>
  );
}
