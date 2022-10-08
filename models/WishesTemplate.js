import mongoose from "mongoose";

/* WishesTemplateSchema will correspond to a collection in your MongoDB database. */
const WishesTemplateSchema = new mongoose.Schema({
	category: {
		type: String
	},
	title: {
		type: String,
		required: [true, "Please provide a valid title for this template."],
		maxlength: [50, "Template title cannot be more than 50 characters"]
	},
	slug: {
		type: String,
		required: [true, "Please provide a valid Slug for this template."],
		maxlength: [50, "Slug cannot be more than 50 characters"]
	},
	metaKeywords: {
		type: Array
	},
	metaDescription: {
		type: String,
		required: [true, "Please provide a valid description for this template."],
		maxlength: [300, "Description cannot be more than 300 characters"]
	},
	gif: {
		type: String,
		required: [true, "Please provide a valid GIF url for this template."],
		maxlength: [300, "GIF url cannot be more than 300 characters"]
	},
	image: {
		type: String,
		required: [true, "Please provide a valid image url for this template."],
		maxlength: [300, "Image url cannot be more than 300 characters"]
	},
	videoLaptopView: {
		type: String,
		required: [true, "Please provide a valid videoLaptopView url for this template."],
		maxlength: [300, "videoLaptopView url cannot be more than 300 characters"]
	},
	videoMobileView: {
		type: String,
		required: [true, "Please provide a valid videoMobileView url for this template."],
		maxlength: [300, "videoMobileView url cannot be more than 300 characters"]
	},
	mobileImageSeq: {
		type: Array
	},
	laptopImageSeq: {
		type: Array
	},
	createdAt: {
		/** The date when the template was created */
		type: Date,
		default: Date.now()
	}
});

export default mongoose.models.WishesTemplate || mongoose.model("WishesTemplate", WishesTemplateSchema);
