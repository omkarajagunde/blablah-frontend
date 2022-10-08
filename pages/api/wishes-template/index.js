import dbConnect from "../../../apiHelpers/DBConnect";
import WishesTemplate from "../../../models/WishesTemplate";
import Cors from "cors";
import mongoose from "mongoose";
import { getStorage, ref, deleteObject, listAll } from "firebase/storage";
import { firebase } from "../../../apiHelpers/firebase";
// Initializing the cors middleware
const cors = Cors({
	methods: ["GET", "POST", "OPTIONS", "DELETE"],
	origin: "https://www.blablah.app"
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

export default async function handler(req, res) {
	// Run the middleware
	//await runMiddleware(req, res, cors);
	const { method, body, query } = req;
	const { deleteId, onlyMetaData } = query;
	await dbConnect();

	if (method === "OPTIONS") {
		return res.status(200).send("ok");
	}

	// Get a Wish or all Wishes based on query param all=true/false
	if (method === "GET") {
		try {
			var wishes;
			if (onlyMetaData) {
				wishes = await WishesTemplate.find({}, { mobileImageSeq: 0, laptopImageSeq: 0, videoMobileView: 0, videoLaptopView: 0 });
			} else {
				wishes = await WishesTemplate.find({});
			}
			res.status(200).json({ data: wishes, status: 200, message: "WishesTemplate sent successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(400).json({ status: 400, message: error, data: [] });
		}
	}

	// Create new Wish
	if (method === "POST") {
		// Validating data
		if (!body) return res.status(400).send({ status: 400, message: "POST body cannot be empty", data: [] });
		const { category, title, slug, metaKeywords, metaDescription, gif, image, videoLaptopView, videoMobileView, _id, laptopImageSeq, mobileImageSeq } = body;

		if (!_id || !mongoose.Types.ObjectId.isValid(_id)) return res.status(400).send({ status: 400, message: "_id key not present or is invalid", data: [] });

		if (!category || category.length <= 3) return res.status(400).send({ status: 400, message: "category key not present or length less than 4", data: [] });

		if (!title || title.length <= 3) return res.status(400).send({ status: 400, message: "title key not present or length less than 4", data: [] });

		if (!slug || slug.length <= 3) return res.status(400).send({ status: 400, message: "slug key not present or length less than 4", data: [] });

		if (!metaKeywords || metaKeywords.length === 0) return res.status(400).send({ status: 400, message: "metaKeywords key not present or length is 0", data: [] });

		if (!metaDescription || metaDescription.length <= 3) return res.status(400).send({ status: 400, message: "metaDescription key not present or length less than 4", data: [] });

		if (!gif || gif.length <= 3) return res.status(400).send({ status: 400, message: "gif key not present or length less than 4", data: [] });

		if (!image || image.length <= 3) return res.status(400).send({ status: 400, message: "image key not present or length less than 4", data: [] });

		if (!videoLaptopView || videoLaptopView.length <= 3) return res.status(400).send({ status: 400, message: "videoLaptopView key not present or length less than 4", data: [] });

		if (!videoMobileView || videoMobileView.length <= 3) return res.status(400).send({ status: 400, message: "videoMobileView key not present or length less than 4", data: [] });

		try {
			// creating blog model
			let templateObj = {
				category,
				_id,
				title,
				slug,
				metaKeywords,
				metaDescription,
				gif,
				image,
				videoLaptopView,
				videoMobileView,
				mobileImageSeq,
				laptopImageSeq
			};

			let temp = await WishesTemplate.findOne({ _id });
			if (temp) {
				temp.category = category;
				temp.title = title;
				temp.slug = slug;
				temp.metaKeywords = metaKeywords;
				temp.metaDescription = metaDescription;
				temp.gif = gif;
				temp.image = image;
				temp.videoLaptopView = videoLaptopView;
				temp.videoMobileView = videoMobileView;
				temp.mobileImageSeq = mobileImageSeq;
				temp.laptopImageSeq = laptopImageSeq;
				const savedTemplate = await temp.save();
				return res.status(200).json({ data: savedTemplate, status: 200, message: "Template updated successfully" });
			}

			const template = new WishesTemplate({ ...templateObj });
			const savedTemplate = await template.save();
			return res.status(200).json({ data: savedTemplate, status: 200, message: "Template saved successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(500).json({ status: 500, message: error.toString(), data: [] });
		}
	}

	// Delete existing Wish
	if (method === "DELETE") {
		if (!body) return res.status(400).send({ status: 400, message: "DELETE body cannot be empty", data: [] });
		if (!body.deleteId || body.deleteId.length === 0) return res.status(400).send({ status: 400, message: "deleteId key empty or not found", data: [] });
		if (!mongoose.Types.ObjectId.isValid(body.deleteId)) return res.status(400).send({ status: 400, message: "deleteId not a valid ObjectId", data: [] });
		try {
			const storage = getStorage(firebase);
			// Create a reference to the file to delete
			const deleteRef = ref(storage, body.deleteId);
			const list = await listAll(deleteRef);
			let filesDeleted = 0;
			for await (const fileRef of list.items) {
				// Delete the object
				await deleteObject(fileRef);
				filesDeleted++;
			}

			const deletedWishesTemplate = await WishesTemplate.deleteOne({ _id: body.deleteId });
			res.status(200).json({ data: deletedWishesTemplate, filesDeleted, status: 200, message: "Template deleted successfully" });
		} catch (error) {
			console.log("Error - ", error);
			res.status(500).json({ status: 500, message: error, data: [] });
		}
	}
}
