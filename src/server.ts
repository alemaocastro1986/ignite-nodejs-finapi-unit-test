import { app } from "./app";
import { connection } from "./database";

connection
  .create()
  .then(() => {
    app.listen(3333, () => {
      console.log("Server is running");
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
