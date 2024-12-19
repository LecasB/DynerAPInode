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

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const newMessage = req.body.message;

      if (!newMessage) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Reference the "menu/actions" node in the Firebase Realtime Database
      const ref = db.ref("menu/actions");

      // Fetch the last record to get the highest current ID
      const snapshot = await ref
        .orderByChild("id")
        .limitToLast(1)
        .once("value");
      const lastItem = snapshot.val();

      let newId = 1;

      if (lastItem) {
        // Get the last key (ID) and increment it
        const lastKey = Object.keys(lastItem)[0];
        newId = parseInt(lastKey) + 1; // Increment the last ID by 1
      }

      const newData = {
        id: newId,
        message: newMessage,
      };

      // Push the new data to Firebase under "menu/actions"
      await ref.push(newData);

      // Respond with the success message and the new data
      res.status(200).json({
        message: "Data successfully added to Firebase!",
        data: newData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    // If method is not POST, return "Method Not Allowed"
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
