import oauth2Client from "../config/google.js";

export function googleLogin(req, res) {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar",
    ],
  });

  res.redirect(url);
}