const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  request.body.likes = request.body.likes || 0;
  const blog = new Blog(request.body);
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findByIdAndDelete(request.params.id);
  if (!blog) return response.status(404).end();
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body;
  if (!blog.title || !blog.url) return response.status(400).end();
  if (!blog.likes) blog.likes = 0;
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  if (!updatedBlog) return response.status(404).end();
  response.json(updatedBlog);
});

module.exports = blogsRouter;
