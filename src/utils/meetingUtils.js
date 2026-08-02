export async function createGoogleMeet(
  title,
  description,
  startDateTime,
  endDateTime
) {
  const API_BASE_URL = "https://sales-tracker-kate.onrender.com";

  const response = await fetch(`${API_BASE_URL}/calendar/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      startDateTime,
      endDateTime,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create Google Meet link");
  }

  return data.hangoutLink;
}