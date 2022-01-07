const mongoose = require("mongoose");
const joi = require("@hapi/joi");

const SmartReplySchema = new mongoose.Schema({
	replies: {
		type: Array,
	},
});

const smartReplyValidationSchema = joi.object({
	replies: joi
		.array()
		.items({
			// warning validations
			text: joi.string().min(3).max(200).required(),
			addedAt: joi.string().min(1).required(),
		})
		.required()
		.allow(null, ""),
});

const smartReplyValidation = (body) => {
	const { error } = smartReplyValidationSchema.validate(body);
	return error;
};

module.exports = { user: mongoose.model("SmartReply", SmartReplySchema), smartReplyValidation };
