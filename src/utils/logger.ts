import path from "path";
import { createLogger, format, transports } from "winston";

const logLevel = process.env.LOG_LEVEL || "info"
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize(),
    format.json()
  ),
  transports: [
    new transports.Console(), 
    new transports.File({
        filename: path.join(__dirname, "logs/app.log"), // log file path
        level: "info",
      }),
      new transports.File({
        filename: path.join(__dirname, "logs/error.log"),
        level: "error",
      }),
    
  ],
});

export default logger;
