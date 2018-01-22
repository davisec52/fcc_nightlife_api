let {User} = require("./../models/users");

let authenticate = (req, res, next) => {

	console.log("Running authenticate");
	console.log("token from authenticate ", req.header("x-auth"));

	if(req.header("x-auth")) {
		let token = req.header("x-auth");

		User.findByToken(token).then((user) => {
			if(!user) {
				return Promise.reject();
			}

			req.user = user;
			req.token = token;
			console.log("Authenticated!");
			next();
		}).catch((e) => res.status(401).send(e));
	}else {
		console.log("Not authenticated!");
		next();
	}

	/*let token = req.header("x-auth");

	User.findByToken(token).then((user) => {
		if(!user) {
			return Promise.reject();
		}

		req.user = user;
		req.token = token;
		next();
	}).catch((e) => res.status(401).send(e));*/
};

module.exports = {
	authenticate
};