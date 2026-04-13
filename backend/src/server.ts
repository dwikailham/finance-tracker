import app from "./app.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
});
