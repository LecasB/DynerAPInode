const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

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

const db = admin.database();

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const ref = db.ref("menu/user");

    // GET method - Fetching user data
    if (req.method === "GET") {
      const snapshot = await ref.once("value");
      const data = snapshot.val();
      return res.status(200).json(data);
    }

    // DELETE method - Deleting a user based on userId
    if (req.method === "DELETE") {
      const { userId } = req.query; // Extract userId from query string

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      // Delete the user from the database
      await ref.child(userId).remove();
      return res
        .status(200)
        .json({ message: `User ${userId} deleted successfully` });
    }

    // Handle unsupported methods
    res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
