import { Hono } from 'hono'

const app = new Hono()

app.get('/api/hono', (c) => {
  return c.json({ name: 'Hono!' })
})

export default app
