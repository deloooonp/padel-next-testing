import React from "react";

const ButtonLoading = () => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-700">Menyiapkan pembayaran...</p>
      </div>
    </div>
  );
};

export default ButtonLoading;
