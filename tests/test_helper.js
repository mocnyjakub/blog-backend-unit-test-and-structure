const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'cos1',
    author: 'jakis1',
    url: 'www.cos.pl1',
    likes: 1,
  },
  {
    title: 'cos2',
    author: 'jakis2',
    url: 'www.cos.pl2',
    likes: 2,
  },
];

const notesInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  notesInDb,
};
