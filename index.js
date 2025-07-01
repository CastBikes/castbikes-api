import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const CYCLE_API_URL = process.env.CYCLE_API_URL;
const CYCLE_USERNAME = process.env.CYCLE_SOFTWARE_USERNAME;
const CYCLE_PASSWORD = process.env.CYCLE_SOFTWARE_PASSWORD;

app.get('/', (req, res) => {
  res.send('castBikes API is live 🚴‍♂️');
});

app.get('/products', async (req, res) => {
  try {
    // Encode de Basic Auth header
    const basicAuth = Buffer.from(`${CYCLE_USERNAME}:${CYCLE_PASSWORD}`).toString('base64');

    const response = await fetch(CYCLE_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      }
    });

    const json = await response.json();

    console.log('CycleSoftware response:', json); // debug

    if (!json.data || !Array.isArray(json.data)) {
      return res.status(500).json({ error: 'Ongeldige response van CycleSoftware' });
    }

    const simplified = json.data.map(item => ({
      barcode: item.barcode,
      merk_model: item.brand ? `${item.brand} ${item.model}` : item.model,
      prijs: item.pricing?.RRP?.cents ? (item.pricing.RRP.cents / 100) + ' EUR' : 'Onbekend',
      voorraad: item.stock?.available,
      kleur: item.color || 'Onbekend'
    }));

    res.json(simplified);
  } catch (error) {
    console.error('❌ Fout bij ophalen van producten', error.message, error.stack);
    res.status(500).json({ error: 'Er ging iets mis', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
