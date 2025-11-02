import { updateBookingStatus, getBookingStatus } from "@/lib/supabase/booking";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    order_id,
    transaction_id,
    transaction_status,
    signature_key,
    status_code,
    gross_amount,
    payment_type,
    expiry_time,
  } = body;

  // Validasi signature
  const expectedSignature = crypto
    .createHash("sha512")
    .update(
      `${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
    )
    .digest("hex");

  if (expectedSignature !== signature_key) {
    console.error("❌ Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const existingStatus = await getBookingStatus(order_id);
  if (existingStatus === "expired" && transaction_status === "settlement") {
    console.warn("⚠️ Late webhook ignored: booking already expired");
    return NextResponse.json({ ignored: true });
  }

  let newStatus = "";

  switch (transaction_status) {
    case "settlement":
      newStatus = "paid";
      break;
    case "pending":
      newStatus = "pending";
      break;
    case "expire":
      newStatus = "expired";
      break;
    case "cancel":
    case "deny":
    case "failure":
      newStatus = "cancelled";
      break;
    default:
      console.warn("⚠️ Unhandled transaction status:", transaction_status);
      return NextResponse.json({ ignored: true });
  }

  try {
    await updateBookingStatus(
      order_id,
      newStatus,
      transaction_id,
      payment_type,
      expiry_time
    );
    console.log(`✅ Booking ${order_id} updated to ${newStatus}`);
  } catch (error) {
    console.error("❌ Failed to update booking:", error);
  }

  return NextResponse.json({ received: true });
}
