export async function createGoogleMeet(
  title,
  description,
  startDateTime,
  endDateTime
) {
  const response = await fetch(
    "http://localhost:5000/calendar/create",
    {
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
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.hangoutLink;
}