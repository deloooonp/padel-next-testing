import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

let snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request) {
  const { order_id, productName, price, quantity } = await request.json();

  const totalAmount = price * quantity;

  let parameter = {
    item_details: [
      {
        id: order_id,
        name: `Booking Lapangan ${productName} (${quantity} Jam)`,
        price: price,
        quantity: quantity,
        category: "Sewa Lapangan",
      },
    ],
    transaction_details: {
      order_id,
      gross_amount: totalAmount,
    },
    enabled_payments: [
      "credit_card",
      "cimb_clicks",
      "bca_klikbca",
      "bca_klikpay",
      "bri_epay",
      "echannel",
      "permata_va",
      "bca_va",
      "bni_va",
      "bri_va",
      "cimb_va",
      "other_va",
      "gopay",
      "indomaret",
      "danamon_online",
      // "akulaku",
      "shopeepay",
      // "kredivo",
      "uob_ezpay",
      "other_qris",
    ],
    page_expiry: {
      duration: 5,
      unit: "minutes",
    },
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
