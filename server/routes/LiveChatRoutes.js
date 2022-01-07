const router = require("express").Router();
const SmartReplyModel = require("../Models/SmartReply");
const { logRequests } = require("../Routes/middlewares");
const { verifyTokenMiddleware } = require("../Routes/middlewares");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");

// [Domain]/api/chat/enablement/get/smart/replies
router.post("/get/smart/replies", logRequests, async (request, response) => {
	const { body } = request;
	// Validating data
});

// [Domain]/api/chat/enablement/get/ads
router.post("/get/ads", logRequests, async (request, response) => {
	const { body } = request;
	// Validating data
});

module.exports = router;
