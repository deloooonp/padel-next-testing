export const calculateEndTime = (start, duration) => {
  // start: string waktu ('16:00'), duration: number jam (1, 2, 3)
  const [hour, minute] = start.split(":").map(Number);

  // Perhitungan jam: (jam mulai + durasi) modulo 24
  const endHour = (hour + duration) % 24;

  // Mengembalikan string waktu yang diformat ('17:00')
  return `${endHour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};
