// index.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.get('/', (req, res) => {
  res.send('CastBikes API is live 🚴‍♂️');
});
const PORT = process.env.PORT || 10000;

const CYCLE_API_URL = 'https://s01.cyclesoftware.nl/api/v4/articledata/entries.json';
const API_KEY = process.env.CYCLE_API_KEY;

app.get('/products', async (req, res) => {
  try {
    const response = await fetch(CYCLE_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    const json = await response.json();

    // Log status en inhoud om te debuggen
    console.log('Status:', response.status);
    console.log('Response JSON:', JSON.stringify(json));

    const simplified = (json.data || []).map(item => ({
      barcode: item.barcode,
      merk_model: item.brand ? `${item.brand} ${item.model}` : item.model,
      prijs: item.pricing.rpp_cents / 100 + ' EUR',
      voorraad: item.stock.available,
      kleur: item.color || 'Onbekend',
    }));

    res.json(simplified);

  } catch (error) {
    console.error('Fout tijdens ophalen van producten:', error);
    res.status(500).json({ error: 'Er ging iets mis' });
  }
});

    res.json(simplified);
  } catch (error) {
    console.error('Fout tijdens ophalen van producten:', error);
    res.status(500).json({ error: 'Er ging iets mis' });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
