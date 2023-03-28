import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import NodeCache from 'node-cache';
import 'isomorphic-fetch';

dotenv.config();

const appCache = new NodeCache({ stdTTL: 60 });
const apiKey = process.env.API_KEY;

const coingecoUrl = apiKey
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';
// eslint-disable-next-line @typescript-eslint/naming-convention
const fetchOptions = apiKey ? { headers: { 'x-cg-pro-api-key': apiKey } } : undefined;

const middleware = async (req: Request, res: Response) => {
  const cacheKey = `__express__${req.originalUrl || req.url}`;

  if (req.originalUrl === '/favicon.ico') {
    // Ignore favicon.
    return res.status(204).end();
  }

  if (appCache.has(cacheKey)) {
    // console.log('Get data from Node Cache');
    return res.send(appCache.get(cacheKey));
  }

  try {
    const data = await fetch(`${coingecoUrl}${req.originalUrl}`, fetchOptions).then(response =>
      response.json(),
    );
    appCache.set(cacheKey, data);
    return res.send(data);
  } catch (e) {
    return res.status(400).end();
  }
};

const app = express();
const port = 3000;

app.use(cors());
app.use('*', middleware);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
