import dbConnect from "../../../apiHelpers/DBConnect";
import WishCategory from "../../../models/WishCategory";
import mongoose from "mongoose";
import Cors from "cors";
// Initializing the cors middleware
const cors = Cors({
	methods: ["GET", "POST", "OPTIONS", "DELETE"],
	origin: "https://www.blablah.app"
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result) => {
			if (result instanceof Error) {
				return reject(result);
			}

			return resolve(result);
		});
	});
}

export default async function handler(req, res) {
	// Run the middleware
	//await runMiddleware(req, res, cors);
	const { method, body, query } = req;
	await dbConnect();

	if (method === "OPTIONS") {
		return res.status(200).send("ok");
	}

	// Get all WishCategories
	if (method === "GET") {
		try {
			const wishesCatgories = await WishCategory.find({});
			res.status(200).json({ data: wishesCatgories, status: 200, message: "wishesCatgories sent successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(400).json({ status: 400, message: error, data: [] });
		}
	}

	// Create new Wish
	if (method === "POST") {
		// Validating data
		if (!body) return res.status(400).send({ status: 400, message: "POST body cannot be empty", data: [] });
		if (!body.name || body.name.length === 0) return res.status(400).send({ status: 400, message: "name key empty or not found", data: [] });

		try {
			// creating WishCatgoey model
			let name = body.name;
			let category = await WishCategory.findOne({ name: name.trim() });
			if (category) return res.status(400).send({ status: 400, message: "Already exists", data: [] });

			const newCatgory = new WishCategory({ name: name.trim() });
			const savedCategory = await newCatgory.save();
			res.status(200).json({ data: savedCategory, status: 200, message: "WishCategory saved successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(500).json({ status: 500, message: error.toString(), data: [] });
		}
	}

	// Delete existing Wish
	if (method === "DELETE") {
		if (!body) return res.status(400).send({ status: 400, message: "DELETE body cannot be empty", data: [] });
		if (!body.deleteId || body.deleteId.length === 0) return res.status(400).send({ status: 400, message: "deleteId key empty or not found", data: [] });
		if (!mongoose.Types.ObjectId.isValid(body.deleteId)) return res.status(400).send({ status: 400, message: "deleteId not a valid ObjectId", data: [] });

		try {
			const deletedWishCategory = await WishCategory.deleteOne({ _id: body.deleteId });
			res.status(200).json({ data: deletedWishCategory, status: 200, message: "WishCategory deleted successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(500).json({ status: 500, message: error, data: [] });
		}
	}
}
