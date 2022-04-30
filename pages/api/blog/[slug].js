import dbConnect from "../../../api/DBConnect";
import Blog from "../../../models/Blog";

export default async function handler(req, res) {
	const { method, body, query } = req;
	const { slug } = query;
	await dbConnect();

	// Get a blog or blogtopics based on query param topics=true/false
	if (method === "GET") {
		try {
			const blog = await Blog.findOne({ blogSlug: slug });
			res.status(200).json({ data: blog, status: 200, message: "Blog topics sent successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(400).json({ status: 400, message: error, data: [] });
		}
	}
}

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "10mb", // Set desired value here
		},
	},
};