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

export const isSlotBooked = (bookings, fieldId, date, slot) => {
  return bookings.some(
    (b) =>
      b.field_id === fieldId &&
      b.date === date &&
      b.slot === slot &&
      b.status === "paid"
  );
};
