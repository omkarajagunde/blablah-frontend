import mongoose from "mongoose";

/* PetSchema will correspond to a collection in your MongoDB database. */
const BlogSchema = new mongoose.Schema({
	blogSlug: {
		/* The title of this blog */

		type: String,
		required: [true, "Please provide a valid slug for this blog."],
		maxlength: [400, "Blog slug cannot be more than 200 characters"],
	},
	blogTitle: {
		/* The title of this blog */

		type: String,
		required: [true, "Please provide a valid title for this blog."],
		maxlength: [300, "Blog title cannot be more than 200 characters"],
	},
	metaKeywords: {
		/* List of meta tags */

		type: Array,
	},
	shortDesc: {
		/* The short description of this blog */

		type: String,
		required: [true, "Please provide the pet owner's name"],
		maxlength: [800, "short description cannot be more than 60 characters"],
	},
	blogImage: {
		/* The image data of your blog */

		type: String,
	},
	blogImageAlt: {
		/* The image data of your blog */

		type: String,
	},
	blogImage: {
		/* The image data of your blog */

		type: String,
	},
	publishedAt: {
		/** The date published for the blog */

		type: Date,
		default: Date.now(),
	},
});

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
