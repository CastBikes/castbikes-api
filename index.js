import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 10000;
const app = express();

const API_URL = process.env.CYCLE_API_URL;           // bijv. https://s01.cyclesoftware.nl/api/v4/articledata/entries.json
const USER = process.env.CYCLESOFTWARE_USERNAME;
const PASS = process.env.CYCLESOFTWARE_PASSWORD;

app.get('/products', async (_, res) => {
  try {
    const auth = Buffer.from(`${USER}:${PASS}`).toString('base64');
    const resp = await fetch(API_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });
    const json = await resp.json();

    if (json.error) {
      console.error('Cyclesoftware response:', json);
      return res.json({ error: 'Ongeldige response van CycleSoftware', response: json });
    }

    const result = json.data.map(item => {
      const pricing = item.pricing;
      // kleur zoeken in supplier_data properties
      let kleur = 'Onbekend';
      if (Array.isArray(item.supplier_data) && item.supplier_data[0]?.[item.supplier_data[0].length - 1]) {
        const props = item.supplier_data[0][item.supplier_data[0].length - 1];
        kleur = props[34] || props['140'] || 'Onbekend';
      }

      return {
        barcode: item.barcode,
        merk_model: `${item.supplier_data?.[0]?.[5] || 'Onbekend'} – ${item.supplier_data?.[0]?.[6] || 'Onbekend'}`,
        prijs: pricing?.ecommerce_price_cents ? `${(pricing.ecommerce_price_cents/100).toFixed(2)} ${pricing.currency}` :
               pricing?.pos_sales_price_cents ? `${(pricing.pos_sales_price_cents/100).toFixed(2)} ${pricing.currency}` :
               pricing?.rrp_cents ? `${(pricing.rrp_cents/100).toFixed(2)} ${pricing.currency}` :
               'Onbekend',
        voorraad: Array.isArray(item.objects) ? item.objects.some(o => o.available) : item.stock?.available,
        kleur,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fout bij ophalen data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op port ${PORT}`);
});
