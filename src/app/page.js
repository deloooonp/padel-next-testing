"use client";

import React, { useState, useEffect } from "react";
import BookingModal from "@/components/BookingModal";
import { generateSlots, isSlotBooked, getBookingDays } from "@/utils/utils";
import { usePadelData } from "@/hooks/usePadelData";
import { useBookingLogic } from "@/hooks/useBookingLogic";
import SkeletonGrid from "@/components/SkeletonGrid";

const slots = generateSlots();

export default function PadelPrototype() {
  const dateOptions = getBookingDays();
  const todayDateString = dateOptions[0].dateString;

  const {
    fields,
    bookings,
    selectedDate,
    setSelectedDate,
    isLoading,
    realtimeStatus,
  } = usePadelData(todayDateString);

  const { loading, message, handleConfirmBooking } =
    useBookingLogic(selectedDate);

  const [modalData, setModalData] = useState(null);
  const [showData, setShowData] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => setShowData(true), 200);
      return () => clearTimeout(timeout);
    } else {
      setShowData(false);
    }
  }, [isLoading]);

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
          <div
            className={
              realtimeStatus === "SUBSCRIBED"
                ? "text-green-500"
                : "text-yellow-500"
            }
          >
            {realtimeStatus === "SUBSCRIBED" ? "🟢 Live" : "🟡 Polling"}
          </div>
        </header>

        <section className="mb-6 bg-gray-800 p-4 rounded-2xl shadow-sm">
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Pilih tanggal
          </label>
          <div
            className="flex space-x-2 overflow-x-auto pb-2 
               md:grid md:grid-cols-7 md:gap-2 md:space-x-0"
          >
            {dateOptions.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date.dateString)}
                className={`
                flex-shrink-0 p-2 rounded-xl border transition-all duration-200 w-20 md:w-auto grid text-center cursor-pointer
                ${
                  selectedDate === date.dateString
                    ? "bg-blue-700 border-blue-700 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                }
              `}
              >
                <span className="block font-semibold text-lg">
                  {date.dayNumber} {date.monthName}
                </span>
                <span className="block text-sm ">{date.dayName}</span>
              </button>
            ))}
          </div>
        </section>

        {message && (
          <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
            {message}
          </div>
        )}

        <section className="grid gap-4">
          {!showData ? (
            <SkeletonGrid />
          ) : (
            fields.map((field) => (
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
                      ["pending", "reserved"]
                    );

                    let buttonStyle = "";
                    let label = s.label;

                    if (booked) {
                      buttonStyle = "bg-red-700 text-white cursor-not-allowed";
                      label = "Booked";
                    } else if (pending) {
                      buttonStyle =
                        "bg-yellow-600 text-white cursor-not-allowed";
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
            ))
          )}
        </section>
      </div>

      {modalData && (
        <BookingModal
          field={modalData.field}
          slot={modalData.slot}
          selectedDate={selectedDate}
          bookings={bookings}
          onClose={() => setModalData(null)}
          onConfirm={handleConfirmBooking}
          isLoading={loading}
        />
      )}
    </main>
  );
}
