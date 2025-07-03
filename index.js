import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

const CYCLE_API_URL = 'https://s01.cyclesoftware.nl/api/v4/articledata/entries.json';
const CYCLE_API_USERNAME = process.env.CYCLE_API_USERNAME;
const CYCLE_API_PASSWORD = process.env.CYCLE_API_PASSWORD;

app.get('/products', async (req, res) => {
  try {
    const response = await fetch(CYCLE_API_URL, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${CYCLE_API_USERNAME}:${CYCLE_API_PASSWORD}`).toString('base64'),
      },
    });

    const data = await response.json();

    if (data.error || !data.data) {
      return res.status(500).json({
        error: 'Ongeldige response van CycleSoftware',
        response: data
      });
    }

    const products = data.data.map(entry => {
      const priceCents = entry?.pricing?.pos_sales_price_cents ?? null;
      const price = priceCents ? `${(priceCents / 100).toFixed(2)} EUR` : 'Onbekend';

      const merk = entry?.supplier_name || 'Onbekend';
      const model = entry?.article_description || entry?.article_id || 'Onbekend';
      const kleur = entry?.color_description?.values?.nl || 'Onbekend';

      return {
        barcode: entry?.barcode || 'Onbekend',
        merk_model: `${merk} - ${model}`,
        prijs: price,
        voorraad: entry?.stock?.available ?? false,
        kleur: kleur
      };
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Interne serverfout', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server draait op poort ${port}`);
});
