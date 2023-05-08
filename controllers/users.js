const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
  });
  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;
  const saltRounds = 10;

  const isPasswordValid = password && password.length >= 3;
  const isUsernameValid = username && username.length >= 3;

  if (!isPasswordValid || !isUsernameValid) {
    return response.status(400).json({
      error: 'password or username is invalid',
    });
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({ username, name, passwordHash });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
