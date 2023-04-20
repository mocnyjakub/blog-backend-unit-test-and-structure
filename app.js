const config = require('./utills/config');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('./utills/logger');
const blogsRouter = require('./controllers/blogs');
const middleware = require('./utills/middleware');
const express = require('express');
const app = express();

mongoose.set('strictQuery', false);

logger.info('connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
