const config = require('./utills/config');
const logger = require('./utills/logger');
const app = require('./app');

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
