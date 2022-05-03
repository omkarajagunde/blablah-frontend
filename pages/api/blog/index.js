import dbConnect from "../../../apiHelpers/DBConnect";
import Blog from "../../../models/Blog";

const dummyData = [
	{
		title: "How to find friends online, How to find friends online",
		blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
		blogImageAlt: "blog-image",
		subTitle:
			"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
		publishedText: "14 Apr 2022",
		readTime: "8 mins",
		blogLink: "/url",
	},
	{
		title: "How to find friends online, How to find friends online",
		blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
		blogImageAlt: "blog-image",
		subTitle:
			"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
		publishedText: "14 Apr 2022",
		readTime: "8 mins",
		blogLink: "/url",
	},
	{
		title: "How to find friends online, How to find friends online",
		blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
		blogImageAlt: "blog-image",
		subTitle:
			"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
		publishedText: "14 Apr 2022",
		readTime: "8 mins",
		blogLink: "/url",
	},
	{
		title: "How to find friends online, How to find friends online",
		blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
		blogImageAlt: "blog-image",
		subTitle:
			"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
		publishedText: "14 Apr 2022",
		readTime: "8 mins",
		blogLink: "/url",
	},
	{
		title: "How to find friends online, How to find friends online",
		blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
		blogImageAlt: "blog-image",
		subTitle:
			"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
		publishedText: "14 Apr 2022",
		readTime: "8 mins",
		blogLink: "/url",
	},
	{
		title: "How to find friends online, How to find friends online, , How to find friends online , How to find friends online ashgdashjdgas",
		blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
		blogImageAlt: "blog-image",
		subTitle:
			"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
		publishedText: "14 Apr 2022",
		readTime: "8 mins",
		blogLink: "/url",
	},
];

function convertToSlug(Text) {
	return Text.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "");
}

export default async function handler(req, res) {
	const { method, body, query } = req;
	const { topics, deleteId } = query;
	await dbConnect();

	// Get a blog or blogtopics based on query param topics=true/false
	if (method === "GET") {
		try {
			const blogs = await Blog.find({}, { blogHtml: 0, blogImage: 0 });
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
	if (method === "PUT") {
		try {
			const blogs = await Blog.find({});
			res.status(200).json({ data: blogs, status: 200, message: "Blog topics sent successfully" });
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

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "10mb", // Set desired value here
		},
	},
};
