const { createLogger, format, transports } = require('winston');

const {
  combine, colorize, timestamp, printf,
} = format;

const logger = createLogger({
  levels: {
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7,
  },
  format: combine(
    colorize(),
    timestamp(),
    printf(info => `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`),
  ),
  transports: [
    new (transports.Console)({
      level: 'info',
      colorize: true,
      silent: (process.env.NODE_ENV === 'test'),
    }),
  ],
});

module.exports = logger;
