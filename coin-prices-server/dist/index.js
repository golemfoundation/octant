var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
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
const middleware = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `__express__${req.originalUrl || req.url}`;
    if (req.originalUrl === '/favicon.ico') {
      // Ignore favicon.
      return res.status(204).end();
    }
    if (appCache.has(cacheKey)) {
      // console.log('Get data from Node Cache');
      return res.send(appCache.get(cacheKey));
    }
    const data = yield fetch(`${coingecoUrl}${req.originalUrl}`, fetchOptions).then(response =>
      response.json(),
    );
    appCache.set(cacheKey, data);
    return res.send(data);
  });
const app = express();
const port = 3000;
app.use(cors());
app.use('*', middleware);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
