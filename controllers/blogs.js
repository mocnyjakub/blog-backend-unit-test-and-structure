const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    id: 1,
    name: 1,
  });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const token = getTokenFrom(request);

  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token is invalid',
    });
  }

  const user = await User.findById(decodedToken.id);
  request.body.user = user._id;
  request.body.likes = request.body.likes || 0;

  const blog = new Blog(request.body);
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);

  await user.save();
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
