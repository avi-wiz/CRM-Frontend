import Nylas from "nylas";
import "dotenv/config";

// The only file that talks to the Nylas SDK directly.
export const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI || "https://api.us.nylas.com",
});

export const NYLAS_CLIENT_ID = process.env.NYLAS_CLIENT_ID;
export const NYLAS_CALLBACK_URI = process.env.NYLAS_CALLBACK_URI;
