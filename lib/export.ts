import type { TripData } from "@/types/trip";

function pad(num: number): string {
  return num.toString().padStart(2, "0");
}

function formatDateICS(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

export function generateICS(tripData: TripData, startDateString: string): string {
  const startDate = new Date(startDateString);
  if (isNaN(startDate.getTime())) {
    throw new Error("Invalid start date");
  }

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Trip Planner//TH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  const now = formatDateICS(new Date());

  tripData.itinerary?.forEach((dayPlan) => {
    // Current day date
    const currentDayDate = new Date(startDate);
    currentDayDate.setDate(startDate.getDate() + (dayPlan.day - 1));

    // Assume the day starts at 09:00 local time
    currentDayDate.setHours(9, 0, 0, 0);

    dayPlan.places?.forEach((place, index) => {
      // Create a 2-hour block for each place
      const eventStart = new Date(currentDayDate);
      eventStart.setHours(eventStart.getHours() + (index * 2));
      
      const eventEnd = new Date(eventStart);
      eventEnd.setHours(eventStart.getHours() + 2);

      const uid = `${Date.now()}-${dayPlan.day}-${index}@aitripplanner.local`;

      let description = `${place.details}\\n`;
      if (place.timeToVisit) description += `\\nเวลาแนะนำ: ${place.timeToVisit}`;
      if (place.ticketPrice) description += `\\nค่าเข้าชม: ${place.ticketPrice}`;
      if (place.travelTime) description += `\\nเวลาเดินทาง: ${place.travelTime}`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${formatDateICS(eventStart)}`,
        `DTEND:${formatDateICS(eventEnd)}`,
        `SUMMARY:${place.name}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${place.name}, ${tripData.destination}`,
        "END:VEVENT"
      );
    });
  });

  icsContent.push("END:VCALENDAR");

  // .ics requires CRLF line endings
  return icsContent.join("\r\n");
}

export function downloadBlob(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
