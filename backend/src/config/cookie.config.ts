import "dotenv/config";

export const setCookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
};
