import dbConnect from "../../apiHelpers/DBConnect";
import PushToken from "../../models/PushTokens";

export default async function handler(req, res) {
	// Run the middleware
	//await runMiddleware(req, res, cors);
	const { method, body, query } = req;
	const { deleteId } = query;
	await dbConnect();

	if (method === "OPTIONS") {
		return res.status(200).send("ok");
	}

	// Get a blog or blogtopics based on query param topics=true/false
	if (method === "GET") {
		try {
			const tokens = await PushToken.find({});
			res.status(200).json({ data: tokens, status: 200, message: "PushTokens sent successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(400).json({ status: 400, message: error, data: [] });
		}
	}

	// Create new Blog
	if (method === "POST") {
		// Validating data
		if (!body) return res.status(400).send({ status: 400, message: "POST body cannot be empty", data: [] });
		if (!body.token || body.token === "") return res.status(400).send({ status: 400, message: "token is (missing/empty)", data: [] });
		if (!body.userAgent || body.userAgent === "") return res.status(400).send({ status: 400, message: "userAgent is (missing/empty)", data: [] });

		try {
			// creating blog model
			const tokenData = new PushToken({ token: body.token, userAgent: body.userAgent });
			const savedTokenData = await tokenData.save();
			res.status(200).json({ data: savedTokenData, status: 200, message: "token data saved successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(500).json({ status: 500, message: error.toString(), data: [] });
		}
	}

	// Delete existing Blog
	if (method === "DELETE") {
		if (!deleteId) return res.status(400).send({ status: 400, message: "deleteId cannot be (missing/empty)", data: [] });
		try {
			const deletedToken = await PushToken.deleteOne({ _id: deleteId });
			res.status(200).json({ data: deletedToken, status: 200, message: "token deleted successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(500).json({ status: 500, message: error, data: [] });
		}
	}
}
