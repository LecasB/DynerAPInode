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
  // Set CORS headers
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
    return res.status(400).json({
      error:
        "All user fields (email, id, password, role, token, username) are required.",
    });
  }

  try {
    const ref = db.ref("menu/users"); // Ensure the correct path in your database
    const snapshot = await ref.once("value");
    const users = snapshot.val() || {}; // Handle the data as an object, not an array

    // Generate a unique key for the new user
    const newUserRef = ref.push(); // This generates a unique ID in Firebase
    const newUserId = newUserRef.key;

    // Set the new user data
    await newUserRef.set({
      id: newUserId, // Use Firebase's unique ID
      ...userData,
    });

    res
      .status(200)
      .json({ message: "User added successfully", userId: newUserId });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
