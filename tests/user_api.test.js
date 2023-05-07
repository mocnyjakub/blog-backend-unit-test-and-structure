const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret', 10);
  const user = new User({ username: 'root', passwordHash });

  await user.save();
});

describe('users api', () => {
  test('creation succeeds with a fresh username', async () => {
    const { body: usersAtStart } = await api.get('/api/users');

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const { body: usersAtEnd } = await api.get('/api/users');
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const newUser = {
      username: 'root',
      password: 'salainen',
    };

    await api.post('/api/users').send(newUser).expect(400);
  });

  test('creation fails with proper statuscode and message if required data is missing', async () => {});

  test('creation fails with proper statuscode and message if data is invalid', async () => {});
});

afterAll(() => {
  mongoose.connection.close();
});
