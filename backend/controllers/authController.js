import { google } from "googleapis";
import oauth2Client from "../config/google.js";
import { supabase } from "../lib/supabase.js";

// 1. Google Login Route handler
export async function googleLogin(req, res) {
  try {
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });

    res.redirect(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 2. Google Callback Route handler
export async function googleCallback(req, res) {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleId = userInfo.data.id;

    // Supabase mein refresh token save karne ka logic (agar zaroorat ho)
    // Yahan apne user ID ke sath tokens save kar lena

    res.redirect("http://localhost:5173/settings?success=true"); // ya jahan bhi frontend redirect karna ho
  } catch (err) {
    console.error("Error in google callback:", err.message);
    res.status(500).json({ error: err.message });
  }
}

// 3. Jo tera pehle se tha (Meet booking wala)
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