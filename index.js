import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const CYCLE_API_URL = process.env.CYCLE_API_URL;
const CYCLE_USERNAME = process.env.CYCLESOFTWARE_USERNAME;
const CYCLE_PASSWORD = process.env.CYCLESOFTWARE_PASSWORD;

app.get('/', (req, res) => {
  res.send('CastBikes API is live 🎉');
});

app.get('/products', async (req, res) => {
  try {
    const response = await fetch(CYCLE_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${CYCLE_USERNAME}:${CYCLE_PASSWORD}`).toString('base64'),
      },
    });

    const raw = await response.text();

    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.error('❌ Kon JSON niet parsen:', raw);
      return res.status(500).json({ error: 'Ongeldige JSON van CycleSoftware', response: raw });
    }

    if (!json.data || !Array.isArray(json.data)) {
      console.error('⚠️ Foutstructuur van CycleSoftware:', json);
      return res.status(500).json({ error: 'Ongeldige response van CycleSoftware', response: json });
    }

    const simplified = json.data.map(item => ({
      barcode: item.barcode || 'Onbekend',
      merk_model: item.brand ? `${item.brand} ${item.model}` : item.model || 'Onbekend',
      prijs: item.pricing?.pos_sales_price_cents
        ? `${(item.pricing.pos_sales_price_cents / 100).toFixed(2)} EUR`
        : 'Onbekend',
      voorraad: item.stock?.available === true ? true : false,
      kleur: item.color || 'Onbekend',
    }));

    res.json(simplified);
  } catch (error) {
    console.error('❌ Fout bij ophalen van producten:', error.message);
    res.status(500).json({ error: 'Er ging iets mis bij het ophalen van producten', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});
