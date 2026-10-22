import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Allow cross-origin requests from your GitHub Pages frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { targetUrl } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing targetUrl' });
  }

  try {
    // 1. Fetch website HTML content safely
    const { data } = await axios.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 MyProjectLibraryScraper/1.0' },
      timeout: 6000
    });

    const $ = cheerio.load(data);

    // 2. Extract OpenGraph structural metadata tags
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Untitled Project';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    // 3. Generate a unique web tracking reference code hash
    const uniqueIdHash = crypto.createHash('md5').update(targetUrl + Date.now()).digest('hex').substring(0, 8).toUpperCase();
    const uniqueWebId = `PROJ-${uniqueIdHash}`;

    // 4. Return data back to your frontend form
    return res.status(200).json({
      projectName: title.trim(),
      projectDescription: description.trim(),
      sampleImageUrl: image,
      uniqueWebId: uniqueWebId,
      projectUrl: targetUrl
    });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to crawl data from provided link', details: err.message });
  }
}