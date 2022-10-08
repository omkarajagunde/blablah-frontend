import mongoose from "mongoose";

/* WishesTemplateSchema will correspond to a collection in your MongoDB database. */
const WishCategorySchema = new mongoose.Schema({
	name: {
		type: String
	}
});

export default mongoose.models.WishCategory || mongoose.model("WishCategory", WishCategorySchema);
