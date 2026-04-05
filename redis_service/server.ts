import app from "./app.js";
import config from "./src/configs/index.config.js";

function startServer(): void {
  app.listen(config.PORT, () => {
    console.log("Server Mode : ", config.DEVELOPMENT_MODE);
    console.log(`Server is running on  : http://localhost:${config.PORT}`);
  });
}

startServer();
