const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {ObjectID} = require("mongodb");

let UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 6,
		unique: true,
		validate: {
			isAsync: false,
			validator: validator.isEmail,
			message: `{value} is not a valid email`
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		unique: true
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		},
		createdAt: {
			type: Number,
			default: (new Date().getTime())
		}
	}],
	attending: [mongoose.Schema.Types.Mixed]
});

UserSchema.methods.toJSON = function() {
	let user = this;
	let userObject = user.toObject();

	return({
		"username": userObject.username,
		"email": userObject.email,
		"_id": userObject._id,
		"attending": userObject.attending
	});
}

UserSchema.methods.removeToken = function(token) {
	let user = this;

	console.log("running removeToken - this ", this);

	try {
		return user.update({
			$pull: {
				tokens: {
					token: token
				}
			}
		});
	}catch (err) {
		return Promise.reject();
	}
};

UserSchema.methods.generateAuthToken = function() {
	let user = this;
	let access = "auth";
	let token = jwt.sign({_id: user._id, access}, "this is the secret").toString();

	user.tokens.push({access, token});

	return user.save().then(() => {
		return token;
	});
}

UserSchema.statics.findByToken = function(token) {
	let User = this;
	let decoded;

	try {
		decoded = jwt.verify(token, "this is the secret");
	}catch (err) {
		return Promise.reject();
	}

	return User.findOne({
		"_id": decoded._id,
		"tokens.token": token,
		"tokens.access": "auth"
	});
}

UserSchema.statics.findByCredentials = function(email, password) {
	let User = this;
	return User.findOne({email: email}).then((user) => {
		if(!user) {
			console.log("No such user or user not found.");
			return Promise.reject();
		}else {
			return new Promise((resolve, reject) => {
				bcrypt.compare(password, user.password, (err, response) => {
					if(!response) {
						reject();
					}else {
						resolve(user);
					}
				});
			});
		}
	});
}

UserSchema.pre("save", function(next) {
	let user = this;

	if(user.isModified("password")) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	}else {
		next();
	}
});


let User = mongoose.model("User", UserSchema);

module.exports = {User};