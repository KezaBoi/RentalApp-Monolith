import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import https from 'node:https';
import fs from 'node:fs';
import helmet from 'helmet';

import { readOnly } from './knexfile.js';
import indexRouter from './routes/index.js'

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://tile.openstreetmap.org/"],
      "connect-src": ["'self'", "https://corsproxy.io/"]
    }
  }
}));

app.use((req, res, next) => {
  req.dbRead = readOnly;
  next();
})


app.use('/', indexRouter)

const credentials = {
  key: fs.readFileSync('./certs/selfsigned.key'),
  cert: fs.readFileSync('./certs/selfsigned.crt')
};

https.createServer(credentials, app).listen(port, () => {
  console.log(`Server listening on https://localhost:${port}`);
});