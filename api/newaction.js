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
      const newMessage = req.body.message;

      if (!newMessage) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ref = db.ref("menu/actions");

      // Fetch the last record to get the highest current ID
      const snapshot = await ref
        .orderByChild("id")
        .limitToLast(1)
        .once("value");
      const lastItem = snapshot.val();

      let newId = 1;

      if (lastItem) {
        const lastKey = Object.keys(lastItem)[0];
        newId = parseInt(lastItem[lastKey].id) + 1; // Increment the highest ID
      }

      const newData = {
        id: newId,
        message: newMessage,
      };

      // Use the custom ID as the key
      await ref.child(newId).set(newData);

      res.status(200).json({
        message: "Data successfully added to Firebase!",
        data: newData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
