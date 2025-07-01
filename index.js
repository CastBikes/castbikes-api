// index.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/products', async (req, res) => {
  try {
    const response = await fetch(process.env.CYCLE_API_URL, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.CYCLESOFTWARE_USERNAME}:${process.env.CYCLESOFTWARE_PASSWORD}`).toString('base64'),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!data || !data.data) {
      return res.status(500).json({
        error: "Ongeldige response van CycleSoftware",
        response: data
      });
    }

    const products = data.data.map(item => {
      const prijsCent = item.pricing?.rpp_cents;
      const kleur = item.color_description?.values?.nl;
      const merk = item.supplier_name || "Onbekend";
      const artikel = item.article_id || "Onbekend";

      return {
        barcode: item.barcode || "Onbekend",
        merk_model: `${merk} - ${artikel}`,
        prijs: prijsCent ? `${(prijsCent / 100).toFixed(2)} EUR` : "Onbekend",
        voorraad: item.stock?.available ?? false,
        kleur: kleur || "Onbekend"
      };
    });

    res.json(products);
  } catch (error) {
    console.error('Fout bij ophalen CycleSoftware data:', error);
    res.status(500).json({ error: "Serverfout bij ophalen CycleSoftware data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});
