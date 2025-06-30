const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ CastBikes API is live!');
});

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
