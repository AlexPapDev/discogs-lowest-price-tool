import express from 'express'
import { getReleaseIdByTitle, getMarketplaceStats, getListInfo, getLists } from './getDiscogsStats.js'

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Set up a simple CORS policy to allow requests from the same origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Define the API endpoint to get Discogs stats
app.get('/api/discogs-stats', async (req, res) => {
  const { artist, title, format, releaseId, currency = 'EUR' } = req.query;

  try {
    let id = releaseId;

    if (!id) {
      // If releaseId is not provided, use artist and title to find it
      if (!artist || !title) {
        return res.status(400).json({ error: 'Please provide either a release ID or both an artist and a title.' });
      }
      id = await getReleaseIdByTitle(artist, title, format);
      if (!id) {
        return res.status(404).json({ error: 'Release not found with the given artist, title, and format.' });
      }
    }

    // Now that we have the release ID, get the marketplace stats
    const stats = await getMarketplaceStats(id, currency);

    if (stats) {
      res.json(stats);
    } else {
      res.status(500).json({ error: 'Failed to retrieve marketplace stats.' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

app.post('/api/get-lowest-prices', async (req, res) => {
  const { releaseIds, currency = 'EUR' } = req.body;

  if (!Array.isArray(releaseIds)) {
    return res.status(400).json({ error: 'releaseIds must be an array.' });
  }

  try {
    const prices = {};
    // Use Promise.all to fetch all prices in parallel
    await Promise.all(
      releaseIds.map(async (releaseId) => {
        const stats = await getMarketplaceStats(releaseId, currency);
        if (stats && stats.lowest_price) {
          prices[releaseId] = stats.lowest_price;
        }
      })
    );
    res.json(prices);
  } catch (e) {
    console.error('API Error:', e);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});


app.get('/api/get-list-info', async (req, res) => {
  const { listId } = req.query;

  try {
    let id = listId;


    // If releaseId is not provided, use artist and title to find it
    if (!id) {
      return res.status(400).json({ error: 'Please provide either a list ID.' });
    }
    const result = await getListInfo(listId);
    console.log(result.items)
    res.json(result.items);
  } catch (e) {
    console.log(e)
  }
})

app.get('/api/get-lists', async (req, res) => {
  const { username } = req.query
  console.log('username', username)
  try {
    // Example hardcoded lists – replace with real Discogs API call if needed
    const result = await getLists(username)
    res.json(result.lists);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch lists" });
  }
});


app.listen(port, () => {
  console.log(`Discogs stats server listening at http://localhost:${port}`);
});
