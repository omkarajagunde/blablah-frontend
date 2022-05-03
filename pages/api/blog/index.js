import dbConnect from "../../../apiHelpers/DBConnect";
import Blog from "../../../models/Blog";
import NextCors from "nextjs-cors";

function convertToSlug(Text) {
	return Text.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "");
}

export default async function handler(req, res) {
	// Run the cors middleware
	// nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
	await NextCors(req, res, {
		// Options
		methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
		origin: ["blablah.app", "blablah.app"],
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	});
	const { method, body, query } = req;
	const { topics, deleteId } = query;
	await dbConnect();

	if (method === "OPTIONS") {
		return res.status(200).send("ok");
	}

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

	// Update existing Blog
	// if (method === "PUT") {
	// 	try {
	// 		const blogs = await Blog.find({});
	// 		res.status(200).json({ data: blogs, status: 200, message: "Blog topics sent successfully" });
	// 	} catch (error) {
	// 		console.log("Error - ", error);
	// 		res.status(500).json({ status: 500, message: error, data: [] });
	// 	}
	// }

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

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "10mb", // Set desired value here
		},
	},
};
