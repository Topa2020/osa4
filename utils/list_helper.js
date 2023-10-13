const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const allLikes = blogs.reduce((total, acc) => total + acc.likes, 0)
  return allLikes   
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const mostLikes = Math.max(...likes)
  const favoriteIndex = blogs.find(blog => blog.likes === mostLikes)
  //delete favoriteIndex._id
  //delete favoriteIndex.url
  //delete favoriteIndex.__v
  return favoriteIndex
}


module.exports = {
  dummy, totalLikes, favoriteBlog
}