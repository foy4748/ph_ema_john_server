const express = require("express");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const cors = require("cors");

const { MongoClient, ObjectId } = mongodb;

require("dotenv").config();

// Initialize Express App
const app = express();

app.use(cors());
app.use(express.json());

// Secret Keys
const uri = process.env.DB_URI;
const { SECRET_JWT } = process.env;
const PORT = process.env.PORT || 3001;

// Collections initializing
let db, productsCollection;

MongoClient.connect(
  uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      console.error("Couldn't connect to DB");
      console.error(err);
      return;
    }
    console.log("Connected to DB");
    db = client.db("TESTDATA");
    // Collections
    productsCollection = db.collection("ema_john_products");
    // ----------------------------------------
  }
);

app.get("/products", async (req, res) => {
  const { p, s } = req.query;
  try {
    const count = await productsCollection.estimatedDocumentCount();
    const products = await productsCollection
      .find({})
      .skip(+p * +s)
      .limit(+s)
      .toArray();
    res.status(200).send({ error: false, count, products }).end();
  } catch (error) {
    console.error(error);
    res.status(501).send({ error: true, message: "Couldn't fetch data" }).end();
  }
});

app.post("/product-query", async (req, res) => {
  try {
    const { query } = req.body;
    if (query || query.length) {
      const query_id_array = query.map((q) => ObjectId(q));
      const products = await productsCollection
        .find({ _id: { $in: query_id_array } })
        .toArray();
      res.status(200).send({ error: false, products });
    } else {
      res.status(403).send({ error: false, products: [] });
    }
  } catch (error) {
    console.error(error);
    res.status(501).send({ error: true });
  }
});

app.listen(PORT, () => {
  console.log(`EMA JOHN SERVER is running at ${PORT}`);
});
