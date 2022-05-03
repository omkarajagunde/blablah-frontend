import dbConnect from "../../../apiHelpers/DBConnect";
import Blog from "../../../models/Blog";
import initMiddleware from "../../../lib/middleware";
import Cors from "cors";

// Initialize the cors middleware
const cors = initMiddleware(
	// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
	Cors({
		// Only allow requests with GET, POST and OPTIONS
		methods: ["GET", "OPTIONS", "PATCH", "DELETE", "POST", "PUT"],
	})
);

export default async function handler(req, res) {
	await cors(req, res);
	const { method, body, query } = req;
	const { slug } = query;
	await dbConnect();

	// Get a blog or blogtopics based on query param topics=true/false
	if (method === "GET") {
		try {
			const blog = await Blog.findOne({ blogSlug: slug });
			res.status(200).json({ data: blog || [], status: 200, message: "Blog topics sent successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(400).json({ status: 400, message: error, data: [] });
		}
	}
}
