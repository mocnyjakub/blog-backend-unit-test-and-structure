const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

const tempBlog = {
  title: 'cos3',
  author: 'jakis3',
  url: 'www.cos.pl3',
  likes: 20,
};

beforeEach(async () => {
  await Blog.deleteMany({});
  for (const blog of helper.initialBlogs) {
    const newBlog = new Blog(blog);
    await newBlog.save();
  }
});

describe('blogs api', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('returned blog should have id property', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].id).toBeDefined();
  });

  test('a valid blog can be added', async () => {
    await Blog(tempBlog).save();
    const response = await api.get('/api/blogs');
    const titles = response.body.map((blog) => blog.title);
    expect(titles).toHaveLength(helper.initialBlogs.length + 1);
    expect(titles[titles.length - 1]).toBe(tempBlog.title);
  });

  test('if likes property is missing it defaults to 0', async () => {
    const blog = { ...tempBlog };
    delete blog.likes;
    await api.post('/api/blogs').send(blog);
    const response = await api.get('/api/blogs');
    const likes = response.body.map((blog) => blog.likes);
    expect(likes).toHaveLength(helper.initialBlogs.length + 1);
    expect(likes[likes.length - 1]).toBe(0);
  });

  test('if title and url properties are missing respond with 400', async () => {
    const blog = { ...tempBlog };
    delete blog.title;
    delete blog.url;
    await api.post('/api/blogs').send(blog).expect(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
