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

      // Ensure all users have a valid 'id' property
      const validIds = users
        .map((user) => user.id)
        .filter((id) => !isNaN(id) && id !== null); // Filter out invalid IDs

      // Determine the next available ID
      const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;

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
