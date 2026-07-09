import { google } from "googleapis";
import oauth2Client from "../config/google.js";

export async function createMeeting(req, res) {
  try {
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
    });

    res.json(response.data);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create meeting",
    });
  }
}