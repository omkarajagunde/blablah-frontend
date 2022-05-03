import dbConnect from "../../../apiHelpers/DBConnect";
import Blog from "../../../models/Blog";
import Cors from "cors";
// Initializing the cors middleware
const cors = Cors({
	methods: ["GET", "POST", "OPTIONS", "DELETE"],
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
function convertToSlug(Text) {
	return Text.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "");
}

export default async function handler(req, res) {
	// Run the middleware
	await runMiddleware(req, res, cors);
	const { method, body, query } = req;
	const { topics, deleteId } = query;
	await dbConnect();

	// Get a blog or blogtopics based on query param topics=true/false
	if (method === "GET") {
		try {
			const blogs = await Blog.find({}, { blogHtml: 0 });
			res.status(200).json({ data: blogs || dummyData, status: 200, message: "Blog topics sent successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(400).json({ status: 400, message: error, data: [] });
		}
	}

	// Create new Blog
	if (method === "POST") {
		// Validating data
		if (!body) return res.status(400).send({ status: 400, message: "POST body cannot be empty", data: [] });

		try {
			// creating blog model
			body["blogSlug"] = convertToSlug(body.blogTitle);
			const blog = new Blog({ ...body });
			const savedBlog = await blog.save();
			res.status(200).json({ data: savedBlog, status: 200, message: "Blog saved successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(500).json({ status: 500, message: error, data: [] });
		}
	}

	// Delete existing Blog
	if (method === "DELETE") {
		try {
			const deletedBlog = await Blog.deleteOne({ _id: deleteId });
			res.status(200).json({ data: deletedBlog, status: 200, message: "Blog deleted successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(500).json({ status: 500, message: error, data: [] });
		}
	}
}
