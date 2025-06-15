import { Hono } from 'hono'
import { getVersion } from './api/getVersion';

const app = new Hono();

app.get('/api/hono', (c) => {
  return c.json({ name: 'Hono!' })
});
app.route('/api', getVersion);

export default app
