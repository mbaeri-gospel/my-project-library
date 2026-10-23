import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import process from 'node:process';

const app = express();

// 1. Enable Cross-Origin Resource Sharing so your GitHub page can communicate with Render
app.use(cors({
  origin: '*' // In production, replace with your actual GitHub Pages URL
}));
app.use(express.json());

// 2. NOW YOU CAN ADD YOUR ROUTES safely
app.get('/ping', (req, res) => {
  return res.status(200).send('Server is awake and active!');
});

app.post('/api/scrape', async (req, res) => {
  const { targetUrl } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target URL targetUrl' });
  }

  try {
    // 2. Fetch the page HTML layout safely
    const { data } = await axios.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MyProjectLibraryScraper/2.0' },
      timeout: 8000
    });

    const $ = cheerio.load(data);

    // 3. Extract metadata layout structures
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Untitled Project';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    // 4. Build your unique tracking web hash ID
    const uniqueIdHash = crypto.createHash('md5').update(targetUrl + Date.now()).digest('hex').substring(0, 8).toUpperCase();
    const uniqueWebId = `PROJ-${uniqueIdHash}`;

    return res.status(200).json({
      projectName: title.trim(),
      projectDescription: description.trim(),
      sampleImageUrl: image,
      uniqueWebId: uniqueWebId,
      projectUrl: targetUrl
    });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to crawl data from Render runtime', details: err.message });
  }
});

// 5. Render dynamically injects an environment PORT variable. You must bind to it.
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Scraper microservice running cleanly on port ${PORT}`);
});
