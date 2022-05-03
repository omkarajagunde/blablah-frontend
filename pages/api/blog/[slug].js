import dbConnect from "../../../apiHelpers/DBConnect";
import Blog from "../../../models/Blog";
import NextCors from "nextjs-cors";

export default async function handler(req, res) {
	// Run the cors middleware
	// nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
	await NextCors(req, res, {
		// Options
		methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
		origin: ["blablah.app/", "blablah.app/"],
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	});
	const { method, body, query } = req;
	const { slug } = query;
	await dbConnect();

	if (method === "OPTIONS") {
		return res.status(200).send("ok");
	}

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
