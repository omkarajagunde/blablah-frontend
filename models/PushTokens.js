import mongoose from "mongoose";

/* PushTokenSchema will correspond to a collection in your MongoDB database. */
const PushTokenSchema = new mongoose.Schema({
	token: {
		type: String
	},
	userAgent: {
		type: String
	}
});

export default mongoose.model("PushToken", PushTokenSchema);
