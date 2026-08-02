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

// 2. Google Callback Route handler (FIXED: Upsert using email as unique key)
export async function googleCallback(req, res) {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    if (!email) {
      throw new Error("Could not retrieve email from Google.");
    }

    // Save token using email so it always matches regardless of ID type
    if (tokens.refresh_token) {
      const { error: dbError } = await supabase
        .from("user_tokens")
        .upsert({
          email: email,
          refresh_token: tokens.refresh_token,
          updated_at: new Date()
        }, { onConflict: 'email' });

      if (dbError) {
        console.error("Supabase Token Save Error:", dbError.message);
      }
    }

    res.redirect("https://salestrackercrm.vercel.app/settings?success=true"); 
  } catch (err) {
    console.error("Error in google callback:", err.message);
    res.status(500).json({ error: err.message });
  }
}

// 3. Google Meet Booking Handler (FIXED: Fetching by email instead of userId)
export async function createGoogleMeetForUser(userEmail, { summary, description, startTime, endTime }) {
  try {
    // Agar tera pehla parameter userId hai, par tu use email ke taur par pass kar raha hai ya email nikal raha hai
    const { data, error } = await supabase
      .from("user_tokens")
      .select("refresh_token")
      .eq("email", userEmail)
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