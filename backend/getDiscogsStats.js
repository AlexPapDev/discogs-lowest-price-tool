/**
 * A simple Node.js script to fetch marketplace stats from the Discogs API.
 * Requires Node.js v18+ for the native `fetch` API.
 * For older Node.js versions, you may need to install `node-fetch` with `npm install node-fetch`.
 */

// Discogs API requires a User-Agent header and a Personal Access Token for authentication.
// You can generate a token from your Discogs Developer Settings page: https://www.discogs.com/settings/developers
const USER_AGENT = 'MyDiscogsApp/1.0';
const DISCOGS_TOKEN = 'ucbxkAYcIUowcxZTGJmtkUjmxgaOlAqIBahzXzrp';

/**
 * Fetches the marketplace stats for a specific Discogs release.
 * @param {number} releaseId The unique ID of the release.
 * @param {string} [currency='EUR'] The currency abbreviation (e.g., 'USD', 'EUR', 'GBP').
 * @returns {Promise<object | null>} A promise that resolves to the stats object on success, or null on error.
 */
async function getMarketplaceStats(releaseId, currency = 'EUR') {
  if (!releaseId) {
    console.error('Error: A releaseId is required.');
    return null;
  }

  const url = `https://api.discogs.com/marketplace/stats/${releaseId}?curr_abbr=${currency}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        // Add the Authorization header with the personal access token
        'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`Error: Discogs API returned status code ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('An error occurred while fetching data:', error.message);
    return null;
  }
}

/**
 * Searches the Discogs database for a release and returns its ID, with optional format filtering.
 * @param {string} artist The artist's name.
 * @param {string} title The release title.
 * @param {string} [format=''] An optional format to filter the search results (e.g., 'Vinyl', 'CD').
 * @returns {Promise<number | null>} A promise that resolves to the release ID, or null if not found.
 */
async function getReleaseIdByTitle(artist, title, format = '') {
  if (!artist || !title) {
    console.error('Error: Both artist and title are required for the search.');
    return null;
  }

  // URL-encode the search parameters
  const encodedArtist = encodeURIComponent(artist);
  const encodedTitle = encodeURIComponent(title);

  let url = `https://api.discogs.com/database/search?artist=${encodedArtist}&release_title=${encodedTitle}&type=release`;
  
  // Add the format filter if provided
  if (format) {
    url += `&format=${encodeURIComponent(format)}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        // Add the Authorization header with the personal access token
        'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`Error: Discogs API search returned status code ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Return the ID of the first result
      return data.results[0].id;
    } else {
      console.log(`No releases found for the given artist, title, and format: "${format}".`);
      return null;
    }
  } catch (error) {
    console.error('An error occurred during the search:', error.message);
    return null;
  }
}

/**
 * Fetches the details of a specific Discogs list.
 * @param {number} listId The unique ID of the list.
 * @returns {Promise<object | null>} A promise that resolves to the list info object on success, or null on error.
 */
async function getListInfo(listId) {
  if (!listId) {
    console.error('Error: A listId is required.');
    return null;
  }

  const url = `https://api.discogs.com/lists/${listId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        // Add the Authorization header with the personal access token
        'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(`Error: Discogs API returned status code ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('An error occurred while fetching data:', error.message);
    return null;
  }
}

// Export the functions to be used in server.js
export {
  getMarketplaceStats,
  getReleaseIdByTitle,
  getListInfo,
};
