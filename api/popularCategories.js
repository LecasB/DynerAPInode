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
    // Reference to the 'menu/menus' node
    const ref = db.ref("menu/menus");
    const snapshot = await ref.once("value");
    const data = snapshot.val();

    if (!data) {
      return res.status(404).json({ error: "No data found" });
    }

    const menuItems = Object.values(data); // Convert the object to an array

    // Shuffle the array and get the first 3 items
    const getRandomItems = (items, num) => {
      const shuffled = items.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };

    const randomItems = getRandomItems(menuItems, 3);

    res.status(200).json(randomItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
