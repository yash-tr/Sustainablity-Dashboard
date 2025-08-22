// src/data/mockData.js
// Robust mock data generator that does NOT use faker.date.between (avoids API mismatch).
// Uses plain JS for dates and random floats.

const departments = ["Spinning", "Weaving", "Dyeing", "Finishing"];
const units = ["Unit A", "Unit B"];
const machines = [
  "Machine 1",
  "Machine 2",
  "Machine 3",
  "Machine 4",
  "Machine 5",
];
const shifts = [1, 2, 3];

function randomFloat(min, max, decimals = 1) {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(decimals));
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateString(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const t = Math.floor(Math.random() * (end - start + 1)) + start;
  return new Date(t).toISOString().slice(0, 10); // YYYY-MM-DD
}

function generateData(count = 300) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      date: randomDateString("2025-01-01", "2025-12-31"),
      shift: randomElement(shifts),
      department: randomElement(departments),
      unit: randomElement(units),
      machine: randomElement(machines),
      energy: randomFloat(50, 200, 1), // kWh
      water: randomFloat(100, 500, 1), // liters
      waste: randomFloat(10, 100, 1), // kg
      emissions: randomFloat(20, 150, 1), // CO2 kg
    });
  }
  return data;
}

const mockData = generateData(300);
export default mockData;
