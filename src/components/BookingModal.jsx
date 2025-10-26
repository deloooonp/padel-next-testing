import React, { useState, useEffect } from "react";
import {
  calculateEndTime,
  isSlotOverlap,
  isTimeBeyondLimit,
} from "@/utils/utils";
import { useBookingLogic } from "@/hooks/useBookingLogic";

export default function BookingModal({
  field,
  slot,
  selectedDate,
  bookings,
  onClose,
  onConfirm,
}) {
  const [endSlot, setEndSlot] = useState(1);
  const [isOverlap, setIsOverlap] = useState(false);
  const [isBeyondLimit, setIsBeyondLimit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const endTime = calculateEndTime(slot, endSlot);

  const { handleConfirmBooking, handlePaymentSuccess } =
    useBookingLogic(selectedDate);

  useEffect(() => {
    const beyond = isTimeBeyondLimit(endTime, 22);
    setIsBeyondLimit(beyond);
  }, [endTime]);

  useEffect(() => {
    const overlap = isSlotOverlap(
      bookings,
      field.id,
      selectedDate,
      slot,
      endTime,
      ["paid", "pending"]
    );
    setIsOverlap(overlap);
  }, [endSlot, bookings, slot, field.id, selectedDate]);

  const checkout = async () => {
    try {
      setIsProcessing(true);

      const bookingData = await handleConfirmBooking(field, slot, endSlot);
      if (!bookingData) {
        alert("Gagal membuat booking pending.");
        return;
      }

      const bookingId = bookingData.id;

      const data = {
        id: field?.id,
        productName: slot,
        price: field?.price_per_hour,
        quantity: endSlot,
      };

      const response = await fetch("/api/midtrans/token", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const requestData = await response.json();

      if (window.snap && requestData.token) {
        setIsProcessing(false);
        window.snap.pay(requestData.token, {
          onSuccess: async function (result) {
            console.log("Payment success:", result);
            console.log("Booking ID:", bookingId);

            await handlePaymentSuccess(bookingId, result.transaction_id);

            onClose();
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            alert("Pembayaran Anda sedang diproses. Status: Pending.");
            onClose();
          },
          onError: function (result) {
            console.error("Payment error:", result);
            alert("Pembayaran gagal.");
          },
          onClose: function () {
            console.log("Payment popup closed.");
          },
        });
      } else {
        alert("Gagal memuat pembayaran.");
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const rupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);

  const isDisabled = isOverlap || isBeyondLimit || isProcessing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      {isProcessing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-700">Menyiapkan pembayaran...</p>
          </div>
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-96">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Konfirmasi Booking
        </h2>
        <p className="text-gray-300 mb-2">Lapangan: {field?.name}</p>
        <p className="text-gray-300 mb-1">Mulai: {slot}</p>
        <p className="text-gray-300 mb-4">Selesai: {endTime}</p>
        <p className="text-gray-300 mb-4">
          Total Harga: {rupiah(endSlot * field?.price_per_hour)}
        </p>

        <div className="mb-4">
          <label className="block text-sm text-gray-200 mb-2">
            Durasi bermain (jam)
          </label>
          <select
            value={endSlot}
            onChange={(e) => setEndSlot(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600 cursor-pointer"
          >
            {[1, 2, 3, 4].map((h) => (
              <option key={h} value={h}>
                {h} jam
              </option>
            ))}
          </select>
        </div>

        {(isOverlap || isBeyondLimit) && (
          <p className="text-red-500 mb-2">
            {isOverlap
              ? "Jam ini sudah dibooking, coba slot lain."
              : "Waktu booking melebihi batas operasional (maks 22:00)."}
          </p>
        )}

        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={isDisabled}
            className={`text-white px-4 py-2 rounded transition-colors ${
              isDisabled
                ? "bg-red-900 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-600 cursor-pointer"
            }`}
            onClick={checkout}
          >
            {isOverlap
              ? "Booked"
              : isProcessing
              ? "Processing..."
              : "Pay & Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
