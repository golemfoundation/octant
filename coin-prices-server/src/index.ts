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

  let data;
  try {
    data = await fetch(`${coingecoUrl}${req.originalUrl}`, fetchOptions);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(1, { originalUrl: req.originalUrl, url: req.url }, { e });
    return res.status(400).end();
  }

  try {
    data = await data.json();
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty('status')) {
      // eslint-disable-next-line no-console
      console.error(`Error (${data.status.error_code}): ${data.status.error_message}`);
      res.status(data.status.error_code).send(data);
      return res.end();
    }

    appCache.set(cacheKey, data);
    return res.send(data);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(2, { data }, { originalUrl: req.originalUrl, url: req.url }, { e });
    return res.status(400).end();
  }
};

const app = express();
const port = 3000;

app.use(
  cors({
    origin: [
      'https://octant.app',
      /\.wildland\.dev/,
      'https://octant.build/',
      'https://octant-landing.netlify.app',
    ],
  }),
);
app.use('*', middleware);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
