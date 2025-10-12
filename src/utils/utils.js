export const calculateEndTime = (startTime, duration) => {
  if (!startTime || typeof duration !== "number" || duration <= 0) {
    // Mengembalikan waktu mulai jika input tidak valid
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
