import express from 'express'

const router = express.Router();


router.get('/postcodes', async (req, res) => {
  const { latitude, longitude, distance } = req.query;

  const targetURL = `https://v0.postcodeapi.com.au/radius.json?&latitude=${latitude}&longitude=${longitude}&distance=${distance}`;

  try {
    const response = await fetch(targetURL);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch postcode data' });
  }
});


router.get('/suburbCenter', async (req, res) => {
  const { postcode, name, state } = req.query;

  let targetURL = 'https://v0.postcodeapi.com.au/suburbs.json?';
  if (postcode) {
    targetURL += `postcode=${postcode}`;
  } else if (name && state) {
    targetURL += `name=${encodeURIComponent(name)}&state=${state}`;
  } else {
    return res.status(400).json({ message: 'Missing required search parameters' });
  }

  try {
    const response = await fetch(targetURL);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Postcode API error' });
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy fetch failed:', error);
    res.status(500).json({ message: 'Internal server proxy error' });
  }
})

export default router;