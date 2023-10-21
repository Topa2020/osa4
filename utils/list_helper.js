const _ = require('lodash')

const dummy = (blogs) => {
  blogs = 1
  return blogs
}

const totalLikes = (blogs) => {
  const allLikes = blogs.reduce((total, acc) => total + acc.likes, 0)
  return allLikes   
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const mostLikes = Math.max(...likes)
  const favoriteIndex = blogs.find(blog => blog.likes === mostLikes)
  delete favoriteIndex._id
  delete favoriteIndex.url
  delete favoriteIndex.__v
  return favoriteIndex
}

const mostBlogs = (blogs) => {
  const authors = blogs.map(a => a.author)
  const theAuthor = _.chain(authors).countBy().toPairs().max(_.last).head().value()
  return theAuthor
}


module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}