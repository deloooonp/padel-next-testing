import React, { useState } from "react";

import { calculateEndTime } from "@/utils/utils";

export default function BookingModal({ field, slot, onClose, onConfirm }) {
  const [endSlot, setEndSlot] = useState(1);

  const endTime = calculateEndTime(slot, endSlot);

  const rupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  const checkout = async (field, slot, endSlot) => {
    const data = {
      id: field?.id,
      productName: slot,
      price: field?.price_per_hour,
      quantity: endSlot,
    };

    const response = await fetch("/api/token", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const requestData = await response.json();
    if (window.snap && requestData.token) {
      window.snap.pay(requestData.token, {
        // Callback saat pembayaran SUKSES
        onSuccess: function (result) {
          console.log("Payment success:", result);

          // 1. Panggil prop onConfirm dari parent component
          // Kirim semua data booking yang dibutuhkan ke DB
          onConfirm(field, slot, endSlot, result.transaction_id);

          // 2. Tutup modal booking
          onClose();
        },
        // Callback saat pembayaran PENDING (misalnya menunggu transfer bank)
        onPending: function (result) {
          console.log("Payment pending:", result);
          alert(
            "Pembayaran Anda sedang diproses. Status: Pending. Cek status berkala."
          );
          // Biasanya, modal ditutup atau diarahkan ke halaman status pending
          onClose();
        },
        // Callback saat pembayaran GAGAL atau ada error
        onError: function (result) {
          console.error("Payment error:", result);
          alert("Pembayaran gagal. Silakan coba lagi.");
          // Biarkan modal tetap terbuka untuk dicoba lagi
        },
        // Callback saat pengguna menutup modal Midtrans Snap
        onClose: function () {
          console.log("Payment popup closed without finishing the transaction");
          // Tidak perlu melakukan apa-apa atau berikan feedback ke user
        },
      });
    } else {
      alert("Gagal memuat pembayaran.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
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
            className="w-full p-2 rounded bg-gray-900 text-white border border-gray-600"
          >
            {[1, 2, 3, 4].map((h) => (
              <option key={h} value={h}>
                {h} jam
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => checkout(field, slot, endSlot)}
          >
            Pay & Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
