/** @format */

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
// middleware
app.use(express()); // for req.body data read
app.use(cors()); // for cors policy

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		const productsCollection = client.db("easy-shop-db").collection("products");
		/// get all products
		app.get("/products", async (req, res) => {
			const { search, sort } = req.query;
			let query = {};
			let sortObj = {};
			if (search) {
				// query = { productName: { $regex: search, $options: "i" } };
				query.productName = { $regex: search, $options: "i" };
			}

			switch (sort) {
				case "lowToHigh":
					sortObj.price = 1;
					break;
				case "highToLow":
					sortObj.price = -1;
					break;
				case "newest":
					sortObj.creationDate = -1;
					break;
				case "oldest":
					sortObj.creationDate = 1;
					break;
				case "default":
					sortObj = {};
					break;
			}
			console.log({ query, search, sort });
			const result = await productsCollection
				.find(query)
				.sort(sortObj)
				.toArray();
			res.send(result);
		});
		// get products quantity
		app.get("/products-quantity", async (req, res) => {
			const result = await productsCollection.estimatedDocumentCount();
			console.log(result);
			res.send({ quantity: result });
		});

		app.get("/", (req, res) => {
			res.send({ message: "This is easy shop server running" });
		});
		app.listen(port, () => {
			console.log("App listening on port 3000!");
		});
		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log("You successfully connected to MongoDB!");
	} finally {
		// Ensures that the client will close when you finish/error
	}
}
run().catch(console.dir);
