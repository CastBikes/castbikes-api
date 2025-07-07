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
const simplified = json.data.map(item => {
  // 1. Merk
  const brandVal = item.properties?.brand?.values?.[0]?.value;
  const merk = typeof brandVal === 'string'
    ? brandVal
    : brandVal?.user || 'Onbekend';

  // 2. Model
  const modelVal = item.properties?.model?.values?.[0]?.value;
  const model = typeof modelVal === 'string'
    ? modelVal
    : modelVal?.user || 'Onbekend';

  // 3. Kleur
  const kleurVal = item.properties?.color_description?.values?.[0]?.value?.user;
  const kleur = kleurVal || 'Onbekend';

  // 4. Modeljaar als optie
  const jaarVal = item.properties?.model_year?.values?.[0]?.value;
  const model_jaar = jaarVal ? jaarVal.toString() : 'Onbekend';

  return {
    barcode: item.barcode || 'Onbekend',
    merk,
    model,
    kleur,
    model_jaar,
    merk_model: `${merk} – ${model}`,
    prijs: item.pricing && item.pricing.rrp_cents != null
      ? (item.pricing.rrp_cents / 100).toFixed(2) + ' EUR'
      : 'Onbekend',
    voorraad: item.stock?.available ?? false
  };
});

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
