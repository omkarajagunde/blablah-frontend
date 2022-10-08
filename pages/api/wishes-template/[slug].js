import dbConnect from "../../../apiHelpers/DBConnect";
import Blog from "../../../models/Blog";
import Cors from "cors";
import WishesTemplate from "../../../models/WishesTemplate";
import mongoose from "mongoose";
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
	await runMiddleware(req, res, cors);
	const { query, method } = req;
	const { slug } = query;
	await dbConnect();

	if (method === "OPTIONS") {
		return res.status(200).send("ok");
	}

	// Get a blog or blogtopics based on query param topics=true/false
	if (method === "GET") {
		try {
			const templateData = await WishesTemplate.findOne({ slug });
			res.status(200).json({ data: templateData || [], status: 200, message: "Template sent successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(400).json({ status: 400, message: error, data: [] });
		}
	}
}
