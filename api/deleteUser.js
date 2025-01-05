const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Firebase Admin SDK if not already initialized
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw new Error("Failed to initialize Firebase Admin SDK");
}

const db = admin.database();

// Helper function to handle CORS
const setCorsHeaders = (res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  } catch (error) {
    console.error("Error setting CORS headers:", error);
    throw new Error("Failed to set CORS headers");
  }
};

// Main function to delete a user
module.exports.deleteUser = async (req, res) => {
  try {
    // Set CORS headers
    setCorsHeaders(res);

    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Ensure the method is DELETE
    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Get the userId from the request
    const userId = req.params.userId || req.body.userId;

    // Validate the userId
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return res.status(400).json({ error: "Invalid or missing User ID" });
    }

    const userRef = db.ref(`menu/user/${userId}`);

    // Check if the user exists
    const snapshot = await userRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await userRef.remove();

    // Respond with success
    return res
      .status(200)
      .json({ message: `User with ID '${userId}' deleted successfully` });
  } catch (error) {
    console.error("Error in deleteUser function:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
