require("dotenv/config");
const app = require("./app");

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.clear();
  console.log(`Server running at http://localhost:${PORT}`);
});
