export const calculateEndTime = (startTime, duration) => {
  if (!startTime || typeof duration !== "number" || duration <= 0) {
    return startTime;
  }

  try {
    const [startHourStr, startMinuteStr] = startTime.split(":");
    let startHour = parseInt(startHourStr, 10);
    let startMinute = parseInt(startMinuteStr, 10);

    if (isNaN(startHour) || isNaN(startMinute)) {
      return startTime;
    }

    let totalMinutes = startMinute + duration * 60;
    let endHour = startHour + Math.floor(totalMinutes / 60);
    let endMinute = totalMinutes % 60;

    // Pastikan format HH:MM
    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(
      2,
      "0"
    )}`;
  } catch (e) {
    console.error("Error calculating end time:", e);
    return startTime;
  }
};

export const generateSlots = () => {
  const s = [];
  for (let h = 10; h <= 21; h++) {
    const hh = String(h).padStart(2, "0");
    s.push({
      label: `${hh}:00 - ${String(h + 1).padStart(2, "0")}:00`,
      value: `${hh}:00`,
    });
  }
  return s;
};

// Cek apakah slot berada di dalam rentang booking
export const isSlotBooked = (bookings, fieldId, date, slot, statusList) => {
  return bookings.some((b) => {
    if (
      b.field_id !== fieldId ||
      b.date !== date ||
      !statusList.includes(b.status)
    )
      return false;

    const [startHour] = b.slot.split(":").map(Number);
    const [endHour] = b.end_slot.split(":").map(Number);
    const [checkHour] = slot.split(":").map(Number);

    return checkHour >= startHour && checkHour < endHour; // slot termasuk di range
  });
};

export const isSlotOverlap = (
  bookings,
  fieldId,
  date,
  slotStart,
  slotEnd,
  statusList
) => {
  const [newStartHour] = slotStart.split(":").map(Number);
  const [newEndHour] = slotEnd.split(":").map(Number);

  return bookings.some((b) => {
    if (
      b.field_id !== fieldId ||
      b.date !== date ||
      !statusList.includes(b.status)
    )
      return false;

    const [bookStart] = b.slot.split(":").map(Number);
    const [bookEnd] = b.end_slot.split(":").map(Number);

    // Overlap check
    return newStartHour < bookEnd && bookStart < newEndHour;
  });
};

// Cek apakah melebihi jam tutup (22:00)
export const isTimeBeyondLimit = (timeStr, limitHour = 22) => {
  try {
    const [hourStr, minuteStr] = timeStr.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Konversi waktu ke total menit untuk perbandingan akurat
    const totalMinutes = hour * 60 + minute;
    const limitMinutes = limitHour * 60;

    return totalMinutes > limitMinutes;
  } catch (e) {
    console.error("Error checking time limit:", e);
    return true; // Asumsikan error berarti di luar batas
  }
};

// Generate semua slot yang diblock untuk UI (dari slot sampai end_slot)
export const generateBlockedSlots = (slot, endSlot) => {
  const [startHour] = slot.split(":").map(Number);
  const [endHour] = endSlot.split(":").map(Number);

  const blocked = [];
  for (let h = startHour; h < endHour; h++) {
    blocked.push(`${String(h).padStart(2, "0")}:00`);
  }
  return blocked;
};
