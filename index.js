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

    console.log('CycleSoftware volledige response:', JSON.stringify(json, null, 2));

    // Stuur gewoon alles terug om te inspecteren
    res.json(json);

  } catch (error) {
    console.error('❌ Fout bij ophalen van producten', error.message, error.stack);
    res.status(500).json({
      error: 'Er ging iets mis',
      details: error.message
    });
  }
});
