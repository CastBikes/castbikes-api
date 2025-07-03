const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s01.cyclesoftware.nl/api/v4/articledata/entries.json",
      {
        headers: {
          Authorization: `Bearer ${process.env.CYCLE_API_TOKEN}`,
        },
      }
    );

    const entries = response.data;

    const products = entries.map((entry) => {
      const barcode = entry.barcode || "Onbekend";

      // Beschrijving ophalen
      const description =
        entry.description?.value?.nl ||
        entry.description?.value?.en ||
        "Onbekend";

      // Kleur ophalen uit color_description of basic_color
      const kleur =
        entry.color_description?.value?.nl ||
        entry.basic_color?.value?.nl ||
        "Onbekend";

      // Prijs ophalen en omzetten van centen naar euro
      const prijsCenten = entry.rrp_cents || entry.pricing?.rrp_cents || 0;
      const prijs =
        prijsCenten > 0
          ? `${(prijsCenten / 100).toFixed(2)} EUR`
          : "Onbekend";

      const voorraad = entry.stock_quantity > 0;

      return {
        barcode,
        merk_model: description,
        prijs,
        voorraad,
        kleur,
      };
    });

    res.json(products);
  } catch (error) {
    console.error("Fout bij ophalen van data:", error.message);
    res
      .status(500)
      .json({ fout: "Er ging iets mis bij het ophalen van CycleSoftware data" });
  }
});

app.listen(port, () => {
  console.log(`API draait op http://localhost:${port}`);
});
