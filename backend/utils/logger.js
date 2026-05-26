const dotenv = require('dotenv');
dotenv.config();

/**
 * ANSI color codes for terminal logging.
 * @type {Object}
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m"
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m"
  }
};

/**
 * Utility object for styled terminal logging.
 * @namespace logger
 */
const logger = {
  /**
   * Logs an informational message.
   * @param {string} msg - The message to log.
   */
  info: (msg) => console.log(`${colors.fg.cyan}ℹ ${msg}${colors.reset}`),

  /**
   * Logs a success message.
   * @param {string} msg - The message to log.
   */
  success: (msg) => console.log(`${colors.fg.green}✅ ${msg}${colors.reset}`),

  /**
   * Logs a warning message.
   * @param {string} msg - The message to log.
   */
  warn: (msg) => console.log(`${colors.fg.yellow}⚠️ ${msg}${colors.reset}`),

  /**
   * Logs an error message.
   * @param {string} msg - The message to log.
   */
  error: (msg) => console.error(`${colors.fg.red}❌ ${msg}${colors.reset}`),

  /**
   * Logs API request details.
   * @param {string} method - HTTP method (GET, POST, etc.).
   * @param {string} url - Request URL.
   * @param {number} status - HTTP status code.
   * @param {number|string} duration - Request duration in milliseconds.
   */
  api: (method, url, status, duration) => {
    let statusColor = colors.fg.green;
    if (status >= 400) statusColor = colors.fg.yellow;
    if (status >= 500) statusColor = colors.fg.red;
    
    console.log(`${colors.fg.magenta}📡 ${method}${colors.reset} ${url} ${statusColor}[${status}]${colors.reset} - ${colors.dim}${duration}ms${colors.reset}`);
  },

  /**
   * Logs a header message with visual separation.
   * @param {string} msg - The header message.
   */
  header: (msg) => {
    console.log(`${colors.bright}${colors.fg.blue}---------------------------------------------------${colors.reset}`);
    console.log(`${colors.bright}${colors.fg.blue}  ${msg}${colors.reset}`);
    console.log(`${colors.bright}${colors.fg.blue}---------------------------------------------------${colors.reset}`);
  },

  /**
   * Logs a visual divider line.
   */
  divider: () => console.log(`${colors.dim}---------------------------------------------------${colors.reset}`)
};

module.exports = logger;
