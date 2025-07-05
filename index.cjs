const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.get('/products', async (req, res) => {
  try {
    const response = await axios.get(process.env.CYCLE_API_URL, {
      headers: {
        'Authorization': `Bearer ${process.env.CYCLE_API_KEY}`
      }
    });

    const rawData = response.data.data || response.data;

    const filteredProducts = rawData.map(product => ({
      id: product.id,
      name: product.name?.nl || product.name,
      article_id: product.article_id,
      brand: product.brand?.value || null,
      image: product.properties?.images?.[0]?.values?.[0]?.value || null,
      price: product.pricing?.[0]?.rrp_cents ? product.pricing[0].rrp_cents / 100 : null,
      color: product.basic_color?.value || product.codelistbase_color?.value || null,
      description: product.description?.values?.[0]?.value || null
    }));

    res.json(filteredProducts);
  } catch (error) {
    console.error('Fout bij ophalen van data:', error.message);
    res.status(500).send('Er ging iets mis bij het ophalen van de producten.');
  }
});

app.listen(port, () => {
  console.log(`API draait op http://localhost:${port}`);
});
