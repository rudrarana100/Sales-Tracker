import { google } from "googleapis";
import oauth2Client from "../config/google.js";
import { supabase } from "../lib/supabase.js";

export async function createMeeting(req, res) {
  try {
    const userEmail = req.user?.email || req.body.email || req.body.userId;

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized: User Email missing" });
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from("user_tokens")
      .select("refresh_token")
      .eq("email", userEmail) 
      .single();

    if (tokenError || !tokenData?.refresh_token) {
      return res.status(400).json({ 
        message: "Google Calendar not connected. Please link your Google account first." 
      });
    }

    oauth2Client.setCredentials({ refresh_token: tokenData.refresh_token });

    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    const {
      title,
      description,
      startDateTime,
      endDateTime,
    } = req.body;

    const event = {
      summary: title,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: Date.now().toString(),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    return res.json(response.data);

  } catch (error) {
    console.error("Error creating user meeting:", error);

    return res.status(500).json({
      message: "Failed to create meeting",
      error: error.message,
    });
  }
}