require("../.config/.config");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {User} = require("./models/users");
let app = express();
let path = require("path");
let publicPath = path.join(__dirname , "../public");
let publicPath2 = path.join(__dirname , "../public/views");
let indexRoutes = require("./routes/indexRoutes");
let port = process.env.PORT || 3000;

//Assistance from https://www.devsbedevin.com/using-the-new-mongoose-connect-method-the-easy-way/
//Now current with current versions of mongo and mongoose

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
	useMongoClient: true,
	promiseLibrary: mongoose.promise
}).then(db => {console.log("mongoDb connected")}).catch((err) => {
	console.log("error connecting to mongoDb");
	throw err;
});

//when user closes screen or leaves app and returns, app.locals.currentUser dumps user record.
//However, the user token continues to persist but leaves user effectively logged out 
//because "x-auth" no longer exists in headers.
//This middleware is primitive device to force deletion of all tokens older than the set time.
app.use(function(req, res, next){
	User.find({}).then((users) => {
		let timeNow = new Date().getTime();
		users.forEach((person) => {
			if(!person.tokens) {
				next();
			}else {
				if(person.tokens.length && timeNow - person.tokens[0].createdAt > 86400000) {
					person.removeToken(person.tokens[0].token).then(() => {

						next();
					}).catch((err) => {console.log("error ", err);});
				}
			}
		});
	}).catch((err) => {
		//A type error is generated whenever there is no token. Error is caught.
		//res.status(400);
		console.log("error ", err);
	});
	next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view options", {layout: false});
app.set("view engine", "html");
console.log("publicPath ", publicPath);
app.use(express.static(publicPath));
app.use(express.static(publicPath2));

app.use("/", indexRoutes);

app.listen(port, () => {
	console.log(`Server listening on ${port}`);
});