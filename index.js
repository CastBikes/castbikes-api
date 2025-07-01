import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const CS_USER = process.env.CYCLESOFTWARE_USERNAME;
const CS_PASS = process.env.CYCLESOFTWARE_PASSWORD;
const CS_KEY = process.env.CYCLE_API_KEY;
const API_URL = process.env.CYCLE_API_URL;

app.get('/', (_, res) => {
  res.send('CastBikes API is live 🎉');
});

app.get('/products', async (_, res) => {
  try {
    const auth = Buffer.from(`${CS_USER}:${CS_PASS}`).toString('base64');
    const response = await fetch(API_URL, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`,
        'X-API-KEY': CS_KEY // Alleen gebruiken als jouw API dat vereist
      }
    });

    const json = await response.json();
    console.log('CycleSoftware response:', JSON.stringify(json, null, 2));

    if (!json.data || !Array.isArray(json.data)) {
      return res.status(500).json({
        error: 'Ongeldige response van CycleSoftware',
        response: json
      });
    }

    const simplified = json.data.map(item => {
      const priceCents =
        item.pricing?.ecommerce_price_cents ?? item.pricing?.pos_sales_price_cents;
      const prijs = priceCents != null
        ? `${(priceCents / 100).toFixed(2)} EUR`
        : 'Onbekend';

      const merk = item.brand ?? '';
      const model = item.model ?? '';
      const merk_model = (merk + ' ' + model).trim() || 'Onbekend';

      const voorraad = item.objects?.some(obj => obj.available) ?? false;

      let kleur = 'Onbekend';
      if (item.supplier_data?.[0]?.[7]) {
        kleur = item.supplier_data[0][7];
      } else if (item.objects?.[0]?.color) {
        kleur = item.objects[0].color;
      }

      return {
        barcode: item.barcode,
        merk_model,
        prijs,
        voorraad,
        kleur
      };
    });

    res.json(simplified);
  } catch (error) {
    console.error('❌ Fout bij ophalen van producten:', error.message, error.stack);
    res.status(500).json({
      error: 'Er ging iets mis bij het ophalen van producten',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
