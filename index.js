import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('CastBikes API is live 🚲');
});

app.get('/products', async (req, res) => {
  try {
    const url = process.env.CYCLE_API_URL;
    const username = process.env.CYCLE_API_USERNAME;
    const password = process.env.CYCLE_API_PASSWORD;

    const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': basicAuth
      }
    });

    const json = await response.json();

    // Controle op juiste data-structuur
    if (!json.data || !Array.isArray(json.data)) {
      return res.status(500).json({
        error: 'Ongeldige response van CycleSoftware',
        response: json
      });
    }

    // Vereenvoudigde mapping van producten
const simplified = json.data.map(item => ({
  barcode: item.barcode || 'Onbekend',
  merk: item.properties?.brand?.values?.[0]?.value || 'Onbekend',
model: item.properties?.model?.values?.[0]?.value?.user || 'Onbekend',
  prijs: item.pricing && item.pricing.rrp_cents != null
    ? (item.pricing.rrp_cents / 100).toFixed(2) + ' EUR'
    : 'Onbekend',
  voorraad: item.stock?.available ?? false,
  kleur: item.color || 'Onbekend'
}));

    res.json(simplified);

  } catch (error) {
    console.error('❌ Fout bij ophalen van producten', error.message);
    res.status(500).json({
      error: 'Er ging iets mis bij het ophalen van producten.',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
