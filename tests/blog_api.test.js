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
    const blogs = await api.get('/api/blogs');
    expect(blogs.body).toHaveLength(helper.initialBlogs.length);
  });

  test('a blog can be deleted', async () => {
    const blogs = await api.get('/api/blogs');
    const blogToDelete = blogs.body[0];
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
    const blogsAfterDelete = await api.get('/api/blogs');
    expect(blogsAfterDelete.body).toHaveLength(blogs.body.length - 1);
    const titles = blogsAfterDelete.body.map((blog) => blog.title);
    expect(titles).not.toContain(blogToDelete.title);
  });

  test('a blog can be updated', async () => {
    const blogs = await api.get('/api/blogs');
    const blogToUpdate = blogs.body[0];
    blogToUpdate.likes = 100;
    await api.put(`/api/blogs/${blogToUpdate.id}`).send(blogToUpdate);
    const blogsAfterUpdate = await api.get('/api/blogs');
    const updatedBlog = blogsAfterUpdate.body.find(
      (blog) => blog.id === blogToUpdate.id
    );
    expect(updatedBlog.likes).toBe(blogToUpdate.likes);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
