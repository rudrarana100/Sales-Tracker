import { supabase } from "@/lib/supabase";

export async function createGoogleMeet(
  title,
  description,
  startDateTime,
  endDateTime
) {
  const API_BASE_URL = "https://sales-tracker-kate.onrender.com";

  // Retrieve authenticated session and user from Supabase
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user || session?.user;

  if (!user) {
    throw new Error("Unauthorized: Please log in to book a Google Meet.");
  }

  const email = user.email || session?.user?.email || "";
  const userId = user.id || session?.user?.id || "";

  if (!email && !userId) {
    throw new Error("User email or ID is required to fetch calendar tokens.");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  if (email) {
    headers["x-user-email"] = email;
  }
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const response = await fetch(`${API_BASE_URL}/calendar/create`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: email,
      userEmail: email,
      userId: userId,
      user_id: userId,
      title,
      description,
      startDateTime,
      endDateTime,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data.error ||
      data.message ||
      data.details ||
      (typeof data === "string" ? data : `Failed to create Google Meet link (Status ${response.status})`);
    throw new Error(errorMessage);
  }

  const meetUrl =
    data.hangoutLink ||
    data.meetingLink ||
    data.meetLink ||
    data.link ||
    data.url ||
    data.htmlLink;

  if (!meetUrl) {
    throw new Error("Google Meet created but no meeting link was returned.");
  }

  return meetUrl;
}