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
      const { email, password, role, username } = req.body;

      // Validate required fields
      if (!email || !password || !role || !username) {
        return res.status(400).json({
          error:
            "All user fields (email, password, role, username) are required.",
        });
      }

      const ref = db.ref("menu/user");

      // Fetch the current data
      const snapshot = await ref.once("value");
      const users = snapshot.val() || []; // Default to an empty array if no users exist

      console.log("Current users:", users); // Log current users

      // Determine the next available ID
      const newId =
        users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;

      console.log("New ID:", newId); // Log new ID

      // Generate a random token
      const randomToken = Math.floor(Math.random() * 900000) + 100000;

      // Prepare the new user object
      const newUser = {
        id: newId,
        email,
        password,
        role,
        token: randomToken,
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
      res
        .status(500)
        .json({ error: `Internal server error: ${error.message}` });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
