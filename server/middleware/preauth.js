const {User} = require("./../models/users");

let preAuth = (req, res, next) => {
	console.log("check for x-auth ", req.header("x-auth"));
	console.log("preauth - email ", req.body.email);
	console.log("preauth - req.body ", req.body);
	console.log("preauth - password ", req.body.password);
	User.findByCredentials(req.body.email, req.body.password).then((user) => {

		if(user.tokens.length > 0) {
			console.log("found token in preAuth ", user.tokens[0].token);
			console.log("tokens array length from preAuth ", user.tokens.length)
		}
		
		if(user === "undefined") {
			console.log("No such user");
			//res.send("No such user - preauth");
			//next();
			return Promise.reject();
		}else {
			if(user.tokens.length > 0) {
				user.removeToken(user.tokens[0].token).then(() => {
					next();
				});
				
			}else {
				if(!user.tokens.length) {
					next();
				}
			}
		}
	}).catch((err) => {console.log("err ", err); res.redirect("back");});
};

module.exports = {preAuth};