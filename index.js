import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('CastBikes API is live 🚴‍♂️');
});

app.get('/products', async (req, res) => {
  try {
    const url = process.env.CYCLE_API_URL;
    const username = process.env.CYCLESOFTWARE_USERNAME;
    const password = process.env.CYCLESOFTWARE_PASSWORD;

    // Basis Auth header bouwen
    const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': basicAuth
      }
    });

    const json = await response.json();

    // Debug
    console.log('CycleSoftware response:', JSON.stringify(json).substring(0, 200));

    if (!json.data || !Array.isArray(json.data)) {
      return res.status(500).json({
        error: 'Ongeldige response van CycleSoftware',
        response: json
      });
    }

    const simplified = json.data.map(item => ({
      barcode: item.barcode || 'Onbekend',
      merk_model: item.brand ? `${item.brand} ${item.model}` : item.model || 'Onbekend',
      prijs: item.pricing?.rpp_cents != null ? (item.pricing.rpp_cents / 100) + ' EUR' : 'Onbekend',
      voorraad: item.stock?.available ?? false,
      kleur: item.color || 'Onbekend'
    }));

    res.json(simplified);

  } catch (error) {
    console.error('❌ Fout bij ophalen van producten:', error.message, error.stack);
    res.status(500).json({
      error: 'Er ging iets mis',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
