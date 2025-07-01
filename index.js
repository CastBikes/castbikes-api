import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

const API_URL = process.env.CYCLE_API_URL;
const USER = process.env.CYCLESOFTWARE_USERNAME;
const PASS = process.env.CYCLESOFTWARE_PASSWORD;

app.get('/products', async (_, res) => {
  try {
    const auth = Buffer.from(`${USER}:${PASS}`).toString('base64');

    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error('CycleSoftware response:', data);
      return res.status(500).json({ error: 'Ongeldige response van CycleSoftware', response: data });
    }

    const result = data.data.map(item => {
      const prijs = item.pricing?.ecommerce_price_cents || item.pricing?.pos_sales_price_cents || item.pricing?.rrp_cents;
      const merk = item.supplier_name || 'Onbekend';
      const model = item.article_id || item.model_id || 'Onbekend';
      const kleur = item.color_description?.values?.nl || 'Onbekend';
      const voorraad = item.stock?.available || false;

      return {
        barcode: item.barcode,
        merk_model: `${merk} – ${model}`,
        prijs: prijs ? `${(prijs / 100).toFixed(2)} EUR` : 'Onbekend',
        voorraad,
        kleur,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Fout bij ophalen data:', err);
    res.status(500).json({ error: 'Interne serverfout' });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
