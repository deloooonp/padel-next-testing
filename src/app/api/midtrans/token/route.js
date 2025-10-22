import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

let snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.SECRET,
  clientKey: process.env.NEXT_PUBLIC_CLIENT,
});

export async function POST(request) {
  const { id, productName, price, quantity } = await request.json();

  const totalAmount = price * quantity;

  let parameter = {
    item_details: [
      {
        id: "FIELD-" + id, // Tambahkan ID unik untuk item
        name: `Booking Lapangan ${productName} (${quantity} Jam)`,
        price: price, // Harga per satuan (per jam)
        quantity: quantity, // Durasi (jumlah jam)
        category: "Sewa Lapangan",
      },
    ],
    transaction_details: {
      // Gunakan ID transaksi yang unik, bukan ID lapangan saja
      order_id: `BOOKING-${Date.now()}-${id}`, // PERBAIKAN 2: Gross amount harus total keseluruhan
      gross_amount: totalAmount,
    }, // (Opsional) Tambahkan detail pelanggan // customer_details: { ... }
  };

  try {
    const token = await snap.createTransactionToken(parameter);
    console.log("Token Midtrans Berhasil:", token);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error creating Midtrans token:", error);
    return NextResponse.json(
      { error: "Failed to create transaction token", details: error.message },
      { status: 500 }
    );
  }
}
