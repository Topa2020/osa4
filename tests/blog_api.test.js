const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')

const api = supertest(app)
const helper = require('./test_helper')
const User = require('../models/user')
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
  test('200 OK and likes are modified corectly', async() => {
    const blogToModify = helper.initialBlogs[0]
    const modifyLikes = {
      likes: 2222
    }
  
    await api
      .put(`/api/blogs/${blogToModify.id}`)
      .send(modifyLikes)
      .expect(200)

    const response = await api.get('/api/blogs')

    expect(response.body[0].likes).toBe(2222)

  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'testaaja1',
      name: 'T Testaaja',
      password: 'passisana',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
  test('password is proper length', async () => {
    const newUser = {
      username: 'testaaja2',
      name: 'T Testaaja',
      password: 'yo'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password must be at least 3 characters long')

  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
