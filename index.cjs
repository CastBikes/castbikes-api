const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/products', async (req, res) => {
  try {
    const response = await axios.get(process.env.CYCLE_API_URL, {
      headers: {
        'X-API-Key': process.env.CYCLE_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Fout bij ophalen van data:', error.message);
    res.status(500).send('Er ging iets mis bij het ophalen van de producten.');
  }
});

app.listen(port, () => {
  console.log(`API draait op http://localhost:${port}`);
});
