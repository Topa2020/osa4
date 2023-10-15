const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const helper = require('./test_helper')

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('right amount of blogs', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('id exists', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('adding blog succeeds', async () => {
  const newBlog = {
    title: 'testi 1',
    author: 'testaaja',
    url:'localhost',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.title)

  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(contents).toContain('testi 1')
})

test('no value for likes', async() => {
  const newBlog = {
    title: 'testi 2',
    author: 'testaaja',
    url:'localhost'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.likes)
  expect(contents[helper.initialBlogs.length]).toBe(0)
})

describe('missing fields', () => {
  test('no url', async() => {
    const newBlog = {
      title: 'testi 2',
      author: 'testaaja',
      likes: 2
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
  test('no title', async() => {
    const newBlog = {
      url: 'localhost',
      author: 'testaaja',
      likes: 2
    }
    
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)    
  })
})

describe('deletion test', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    
    const blogsAtStart = await helper.initialBlogs
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
    
    const response = await api.get('/api/blogs')
    const blogsAtEnd = response.body

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const title = blogsAtEnd.map(r => r.title)

    expect(title).not.toContain(blogToDelete.title)
})  
})

describe('modify blogs test', () => {
  test('200 OK', async() => {
    const blogToModify = helper.initialBlogs[0]
    const modifyLikes = {
      likes: 2222
    }
  
    await api
      .put(`/api/blogs/${blogToModify.id}`)
      .send(modifyLikes)
      .expect(200)


  })

  
})


afterAll(async () => {
  await mongoose.connection.close()
})