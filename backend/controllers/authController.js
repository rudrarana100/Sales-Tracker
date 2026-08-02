import { google } from "googleapis";
import oauth2Client from "../config/google.js";
import { supabase } from "../lib/supabase.js";

export async function createGoogleMeetForUser(userId, { summary, description, startTime, endTime }) {
  try {
    const { data, error } = await supabase
      .from("user_tokens")
      .select("refresh_token")
      .eq("user_id", userId)
      .single();

    if (error || !data?.refresh_token) {
      throw new Error("Google Calendar not connected for this user. Please link your account.");
    }

    oauth2Client.setCredentials({ refresh_token: data.refresh_token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: summary || "Sales Discovery Meeting",
      description: description || "Outbound CRM Meeting Session",
      start: { dateTime: startTime },
      end: { dateTime: endTime },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetingLink = response.data.hangoutLink;
    const eventId = response.data.id;

    return { success: true, meetingLink, eventId };
  } catch (err) {
    console.error("Error creating Google Meet for user:", err.message);
    throw err;
  }
}