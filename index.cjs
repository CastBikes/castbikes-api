const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('CycleSoftware API is live! Gebruik /products voor de data.');
});

app.get('/products', async (req, res) => {
  try {
    const response = await axios.get(process.env.CYCLE_API_URL, {
      headers: {
        'Authorization': `Bearer ${process.env.CYCLE_API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Fout bij ophalen van data:', error.response?.status, error.message);
    res.status(error.response?.status || 500).send('Er ging iets mis bij het ophalen van de producten.');
  }
});

app.listen(port, () => {
  console.log(`API draait op http://localhost:${port}`);
});