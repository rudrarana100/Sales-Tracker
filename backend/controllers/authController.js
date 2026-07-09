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

export async function googleCallback(req, res) {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);

    console.log(tokens);

    res.send("Google connected successfully ✅");
  } catch (error) {
    console.error(error);

    res.status(500).send("Authentication failed.");
  }
}