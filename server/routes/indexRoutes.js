const express = require("express");
const router = express.Router();
const config = require("../../.config/.config");
const app = express();
const request = require("request");
const mongoose = require("mongoose");
const {MongoClient, ObjectID} = require("mongodb");
const {Search, Destination, Review} = require("../models/entertainment");
const {User} = require("../models/users");
const {preAuth} = require("../middleware/preauth");
const {authenticate} = require("../middleware/authenticate");
const bcrypt = require("bcryptjs");

app.locals.currentUser = {};

router.get("/", (req, res) => {
	res.redirect("/search.html");
});

router.get("/app-locals", (req, res, next) => {
	res.json(app.locals.currentUser);
});

router.get("/user-data/", (req, res, next) => {
	let username = app.locals.currentUser.username;
	User.findOne({username: username}).then((user) => {
		res.json(user);
	});
});

router.get("/register", (req, res, next) => {
	res.redirect("/register.html");
});

router.post("/register", (req, res, next) => {
	
	let user = new User({
		username: req.body.username,
		email: req.body.email,
		password: req.body.password,
		going: false
	});

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		app.locals.currentUser._id = user._id;
		app.locals.currentUser.username = user.username;
		app.locals.currentUser.token = token;
		res.header("x-auth", token).redirect("/search.html");
	}).catch((err) => res.status(400).send(err));
});

router.get("/login",(req, res, next) => {
	res.redirect("/login.html");
});

router.post("/login/user", preAuth, (req, res, next) => {
	User.findByCredentials(req.body.email, req.body.password).then((user) => {
		if(user.tokens.length > 0) {
			res.send({"error": "Currently logged in"});
			return;
		}

		if(!user) {
			res.send({"error":"undefined"});
			return;
		}

		return user.generateAuthToken().then((token) => {
			app.locals.currentUser._id = user._id;
			app.locals.currentUser.username = user.username;
			app.locals.currentUser.token = token;
			res.header("x-auth", token).redirect("/search.html");
		});
		
	}).catch((err) => {
		res.status(400)/*.send({"error": "Bad request; failure to find match."})*/;
		next();
	});
	
});

router.post("/user-remove/:locName", (req, res) => {
	console.log("app.locals.currentUser.username ", app.locals.currentUser.username);
	let toRemove = {
		"name": req.params.locName
	};
	console.log("toRemove.name ", toRemove.name);
	User.findOne({username: app.locals.currentUser.username}).then((user) => {
		console.log("user ", user);
		console.log("user.attending ", user.attending);

			user.attending.forEach((loc, index, ar) => {
				if(loc === toRemove.name) {
					let pos = ar.indexOf(loc);
					console.log("pos ", pos);
					ar.splice(pos, 1);
				}
			});
			user.save();

			console.log("list - user.attending ", user.attending);

			res.json(user);
		

	}).catch((err) => {console.log(err);});
});

router.post("/user-add/:locName", (req, res) => {
	console.log("app.locals.currentUser.username ", app.locals.currentUser.username);
	let name = {
		"name": req.params.locName
	};
	console.log("name ", name);

	User.findOne({username: app.locals.currentUser.username}).then((user) => {
		console.log("user ", user);
		console.log("user.attending ", user.attending);
		user.attending.push(name.name);
		user.save();

		res.json(user);

	}).catch((err) => {console.log(err);});
});

router.delete("/login/user/logout", authenticate, (req, res, next) => {
	console.log("delete - req.token ", req.token);
	req.user.removeToken(req.token).then(() => {
		app.locals.currentUser = {};
		res.status(200).send("You have successfully logged out!");
	}, err => res.status(400).send({"error": "Problem with token deletion."}));
});

router.get("/search/:term", (req, res) => {
	console.log("search params ", req.params.term);

	Search.findOne({region: req.params.term}).then((search) => {
		if(search) {

			//if new search performed at or greater 24 hours later, the collection is dropped and re-created.
			if(new Date().getTime() - search.createdAt >= 8600000) {
				mongoose.connection.db.dropCollection("searches").then((result) => {
					console.log("collection searches deleted bc of age");
				}).catch((err) => {console.log(err);});

				console.log("New searches coll sent to businessInfoAndDatabase for re-creation");
				businessInfoAndDatabase();
			}
				
				res.json(search);
		}
			console.log("No existing search. Calling next func");
			businessInfoAndDatabase();

	}).catch((err) => {console.log(err);});

	let businessInfoAndDatabase = () => {
		options = {
			method: "GET",
			url:  `https://api.yelp.com/v3/businesses/search?term=restaurant&location=${req.params.term}`,
		    	headers: {
		    		"Access-Control-Allow-Origin": true,
		    		//"Authorization": config.ACCESS_TOKEN,
		    		"Authorization": process.env.ACCESS_TOKEN,
		    		"Access-Control-Allow-Methods" :'GET,PUT,POST,DELETE',
		    		"Access-Control-Allow-Headers" :"Origin, X-Requested-With, Content-Type, Accept"
		    	}
		}

		request(options, (error, response, body) => {
			let result = JSON.parse(body);
			console.log("result from request ", result);
			let data = result.businesses;
			let searchTerm = req.params.term;

			let appLocalsLength = Object.keys(app.locals.currentUser).length;
			if(!appLocalsLength === 0) {
				let id = 0;
				let username = 0;
			}else {
				id = app.locals.currentUser._id;
				username = app.locals.currentUser.username;
			}
			
			console.log("searchTerm request ", searchTerm);

			let newSearch = new Search({
				user: {
					id: id,
					username: username
				},
				region: searchTerm,
				businesses: [],
				createdAt: new Date().getTime()
			});
			newSearch.save();

			destArray = [];

			data.forEach(function(loc) {
				let newDestination = {
					locId: loc.id,
					searchId: newSearch._id,
					name: loc.name,
					price: loc.price,
					rating: loc.rating,
					image_url: loc.image_url,
					url: loc.url,
					location: loc.location.address1,
					reviews: []
				};

				Destination.create(newDestination).then((response) => {

				}).catch((e) => {console.log(e);});

				destArray.push(newDestination);
			});

			newSearch.businesses = destArray;
			newSearch.save();

		}).pipe(res);

	} //ending bracket for businessInfoAndDatabase()

});

router.get("/business/reviews/:id", (req, resres) => {
	console.log("resres ", resres.statusCode);

		let id = req.params.id;

		Review.findOne({revId: id}).then((rev) => {
			if(rev) {
				console.log("time elaspsed ", new Date().getTime() - rev.reviewCreatedAt);

				if(new Date().getTime() - rev.reviewCreatedAt >= 86400000) {
					mongoose.connection.db.dropCollection("reviews").then((result) => {
						console.log("collection reviews deleted");
					}, err => console.log(err));
					callReviews(id);
				}
					resres.json(rev);
			}
				callReviews(id);

		}, err => {console.log()}).catch((err) => {console.log(err);});


		let callReviews = (id) => {
			reviewOptions = {
				method: "GET",
				url: `https://api.yelp.com/v3/businesses/${id}/reviews`,
			    	headers: {
			    		"Access-Control-Allow-Origin": true,
			    		//"Authorization": config.ACCESS_TOKEN,
			    		"Authorization": process.env.ACCESS_TOKEN,
			    		"Access-Control-Allow-Methods" :'GET,PUT,POST,DELETE',
			    		"Access-Control-Allow-Headers" :"Origin, X-Requested-With, Content-Type, Accept"
			    	}
			};

			request(reviewOptions, (error, response, body) => {
				console.log("response detected ", response.statusCode);
				if(response.statusCode > 500) {
					return;
				}

				let reviews = JSON.parse(body);
				let reviewCollection = reviews.reviews;

				reviewCollection.forEach((rev) => {
					let newReviews = {
						revId: id,
						url: rev.url,
						text: rev.text
					}

					Review.create(newReviews).then((rev) => {
						rev.reviewCreatedAt = new Date().getTime();
						rev.save();
					}, err => console.log(err)).catch((err) => {console.log(err);});
				});

			}).pipe(resres);
		} //closing braket for callReviews()
});


module.exports = router;
