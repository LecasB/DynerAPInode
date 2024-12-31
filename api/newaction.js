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
      const { email, id, password, role, token, username } = req.body;

      // Validate required fields
      if (!email || !id || !password || !role || !token || !username) {
        return res.status(400).json({
          error:
            "All user fields (email, id, password, role, token, username) are required.",
        });
      }

      const ref = db.ref("menu/users");

      // Fetch the current data
      const snapshot = await ref.once("value");
      const users = snapshot.val() || []; // Default to an empty array if no users exist

      // Determine the next available ID
      const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

      // Prepare the new user object
      const newUser = {
        id: newId,
        email,
        password,
        role,
        token,
        username,
      };

      // Add the new user to the array
      users.push(newUser);

      // Save the updated array back to Firebase
      await ref.set(users);

      res.status(200).json({
        message: "User added successfully",
        data: newUser,
      });
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
