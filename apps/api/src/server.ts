import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import 'dotenv/config';
import { registerRoutes } from './routes.js';

const PORT = Number(process.env.PORT || 3001);
const DATA_PATH = process.env.DATA_PATH || './data/db.json';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(swagger, {
  openapi: {
    info: { title: 'ZOVI-ME-DOCU API', version: '0.0.1' },
  },
});
await app.register(swaggerUI, { routePrefix: '/docs' });

await registerRoutes(app, DATA_PATH);

app.listen({ port: PORT, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
