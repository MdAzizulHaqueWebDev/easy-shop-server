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

		// const getProducts = async (req, res) => {
		// 	try {
		// 		const {
		// 			search,
		// 			sort,
		// 			category,
		// 			brand,
		// 			pricerange,
		// 			size,
		// 			currentPage,
		// 			pageSize,
		// 		} = req.query;

		// 		// Build query object based on filtering criteria
		// 		let query = {};

		// 		if (search) query.name = { $regex: search, $options: "i" }; // Search by product name, case-insensitive
		// 		if (category) query.category = category;
		// 		if (brand) query.brand = brand;
		// 		if (pricerange) {
		// 			const [minPrice, maxPrice] = pricerange.split("-");
		// 			query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
		// 		}
		// 		if (size) query.size = size;

		// 		// Handle Sorting (e.g., by price, name)
		// 		let sortCriteria = {};
		// 		if (sort === "price") sortCriteria.price = 1; // Ascending
		// 		else if (sort === "price_desc") sortCriteria.price = -1; // Descending
		// 		// Add more sorting options as needed

		// 		// Pagination logic
		// 		const page = Number(currentPage) || 1;
		// 		const limit = Number(pageSize) || 10;
		// 		const skip = (page - 1) * limit;

		// 		// Get total count for pagination
		// 		const totalProducts = await Product.countDocuments(query);

		// 		// Execute query with filtering, sorting, and pagination
		// 		const products = await Product.find(query)
		// 			.sort(sortCriteria)
		// 			.skip(skip)
		// 			.limit(limit);

		// 		res.json({
		// 			products,
		// 			totalPages: Math.ceil(totalProducts / limit),
		// 			currentPage: page,
		// 		});
		// 	} catch (error) {
		// 		res.status(500).json({ message: "Server error" });
		// 	}
		// };

		/// get all products
		app.get("/products", async (req, res) => {
			const {
				search,
				sort,
				brand,
				pricerange,
				category,
				currentPage,
				size,
			} = req.query;
			let query = {};
			let sortOptions = {};
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
					sortOptions.price = 1;
					break;
				case "highToLow":
					sortOptions.price = -1;
					break;
				case "newest":
					sortOptions.creationDate = -1;
					break;
				case "oldest":
					sortOptions.creationDate = 1;
					break;
				case "default":
					sortOptions = {};
					break;
				default:
			}

			// Pagination logic
			const pageCurrent = Number(currentPage) || 1;
			const limit = Number(size) || 10;
			const skip = (pageCurrent - 1) * limit;

			// Get total count for pagination
			const totalProducts = await productsCollection.countDocuments(query);

			const result = await productsCollection
				.find(query)
				.sort(sortOptions)
				.skip(skip)
				.limit(limit)
				.toArray();

			res.send({
				products: result,
				totalPages: Math.ceil(totalProducts / limit),
				currentPage: pageCurrent,
			});
		});

		app.get("/", (req, res) => {
			res.send({ message: "This is easy shop server running" });
		});
		app.listen(port, () => {});
	} finally {
		// Ensures that the client will close when you finish/error
	}
}
run().catch(console.log())