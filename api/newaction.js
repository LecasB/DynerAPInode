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

  if (req.method === "POST") {
    try {
      const newMessage = req.body.message; // Access the message sent in the POST request body

      if (!newMessage) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Reference the Firebase node where data will be saved
      const ref = db.ref("menu/actions");

      // Get the current data to determine the last id
      const snapshot = await ref
        .orderByChild("id")
        .limitToLast(1)
        .once("value");
      const lastItem = snapshot.val();

      let newId = 1; // Default ID is 1 if there is no existing data

      // If there's data, increment the last ID by 1
      if (lastItem) {
        const lastId = Object.keys(lastItem)[0]; // Get the ID of the last item
        newId = parseInt(lastId) + 1; // Increment the ID
      }

      // Create a new object with the new id and message
      const newData = {
        id: newId,
        message: newMessage,
      };

      // Push the new data under the "actions" node
      const newRef = ref.push();
      await newRef.set(newData); // Save the data to Firebase

      // Send success response
      res.status(200).json({
        message: "Data successfully added to Firebase!",
        data: newData,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // If the method is not POST, respond with method not allowed
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
