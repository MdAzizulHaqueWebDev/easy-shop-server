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
			const {
				search,
				sort,
				brand,
				pricerange,
				category,
				currentPage,
				size: strSize,
			} = req.query;
			const size = parseInt(strSize);
			const currentPageNo = parseInt(currentPage);
			let query = {};
			let sortObj = {};
			if (search) {
				query.productName = { $regex: search, $options: "i" };
			}
			if (category && category != "none") {
				query.category = { $regex: category, $options: "i" };
			}
			if (brand && brand != "none") {
				query.brand = { $regex: brand, $options: "i" };
			}

			switch (pricerange) {
				case "below200":
					query.price = { $lte: 200 };
					break;
				case "20ToMax":
					query.price = { $gte: 200 };
					break;
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
			const result = await productsCollection
				.find(query)
				.sort(sortObj)
				.limit(size)
				.skip(currentPageNo * size)
				.toArray();
			res.send(result);
		});
		// get products quantity
		

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
