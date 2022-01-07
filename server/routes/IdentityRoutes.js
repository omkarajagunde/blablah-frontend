const { canvas, faceDetectionNet, faceDetectionOptions } = require("../helpers/ageAndGenderDetection");
const faceapi = require("face-api.js");
const router = require("express").Router();
const UserModel = require("../Models/User");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
const { logRequests } = require("./middlewares");

// api.[Domain]/api/chat/identity/agdetector
router.post("/agdetector", async (request, response) => {
	const { body } = request;

	await faceDetectionNet.loadFromDisk(expressServerRoot + "/Resources/");
	await faceapi.nets.ageGenderNet.loadFromDisk(expressServerRoot + "/Resources/");
	const img = await canvas.loadImage(body.imageURL);
	const results = await faceapi.detectAllFaces(img, faceDetectionOptions).withAgeAndGender();
	if (results.length > 0) response.status(200).send({ status: 200, message: "success", data: results[0] });
	else response.status(500).send({ status: 500, message: "failure, image sent was not neat", data: [] });
});

module.exports = router;
