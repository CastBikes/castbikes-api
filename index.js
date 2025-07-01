import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.CYCLE_API_KEY;
const CYCLE_API_URL = process.env.CYCLE_API_URL;

app.get('/', (req, res) => {
  res.send('CastBikes API is live 🚲');
});

app.get('/products', async (req, res) => {
  try {
    const response = await fetch(CYCLE_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const json = await response.json();
    console.log('CycleSoftware response:', json); // DEBUG LOG

    if (!json.data || !Array.isArray(json.data)) {
      return res.status(500).json({ error: 'Ongeldige response van CycleSoftware' });
    }

    const simplified = json.data.map(item => ({
      barcode: item.barcode,
      merk_model: item.brand ? `${item.brand} ${item.model}` : item.model,
      prijs: item.pricing?.rpp_cents ? (item.pricing.rpp_cents / 100) + ' EUR' : 'Onbekend',
      voorraad: item.stock?.available,
      kleur: item.color || 'Onbekend'
    }));

    res.json(simplified);
  } catch (error) {
    console.error('❌ Fout bij ophalen van producten:', error.message, error.stack);
    res.status(500).json({ error: 'Er ging iets mis', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
