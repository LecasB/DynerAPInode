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

module.exports.insertUser = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const userData = req.body;

  // Validate required fields
  if (
    !userData.email ||
    !userData.id ||
    !userData.password ||
    !userData.role ||
    !userData.token ||
    !userData.username
  ) {
    return res
      .status(400)
      .json({
        error:
          "All user fields (email, id, password, role, token, username) are required.",
      });
  }

  try {
    const ref = db.ref("menu/user");

    // Fetch the existing user data to find the next available index
    const snapshot = await ref.once("value");
    const users = snapshot.val() || [];
    const nextIndex = users.length; // Determine the next numeric key

    // Add the new user at the next available index
    await ref.child(nextIndex).set(userData);

    res
      .status(200)
      .json({ message: "User added successfully", userIndex: nextIndex });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
