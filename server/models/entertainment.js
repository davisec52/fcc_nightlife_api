const mongoose = require("mongoose");

let destinationSchema = new mongoose.Schema({
	searchId: String,
	locId: String,
	name: String,
	price: String,
	rating: String,
	image_url: String,
	count: {type: Number, default: 0},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	location: Object,
	reviews: Array,
	createdAt: Number
});

let reviewSchema = new mongoose.Schema({
	authorId: String,
	revId: String,
	url: String,
	text: String,
	reviewCreatedAt: Number
});

let searchSchema = new mongoose.Schema({
	authorId: String,
	region: String,
	businesses: Array,
	user: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	businesses: Array,
	createdAt: Number
});


let Review = mongoose.model("Review", reviewSchema);
let Destination = mongoose.model("Destination", destinationSchema);
let Search = mongoose.model("Search", searchSchema);

module.exports = {
	Destination,
	Search,
	Review
}