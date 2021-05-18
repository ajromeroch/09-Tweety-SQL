"use strict";
var express = require("express");
var router = express.Router();
const client = require("../db");

module.exports = router;

// una función reusable
function respondWithAllTweets(req, res, next) {
	client.query("SELECT * FROM tweets", (err, data) => {
		if (err) return next(err);
		var allTheTweets = data.rows;
		res.render("index", {
			title: "Twitter.js",
			tweets: allTheTweets,
			showForm: true,
		});
	});
}

// aca basícamente tratamos a la root view y la tweets view como identica
router.get("/", respondWithAllTweets);
router.get("/tweets", respondWithAllTweets);

// página del usuario individual
router.get("/users/:username", function (req, res, next) {
	client.query(
		"SELECT tweets.content FROM tweets INNER JOIN users ON users.id = tweets.user_id WHERE users.name=$1",
		[req.params.username],
		(err, data) => {
			if (err) return next(err);
			let tweetsForName = data.rows;
			res.render("index", {
				title: "Twitter.js",
				tweets: tweetsForName,
				showForm: true,
				username: req.params.username,
			});
		}
	);
});

// página del tweet individual
router.get("/tweets/:id", function (req, res, next) {
	client.query("SELECT tweets.content FROM tweets WHERE tweets.id = $1", [req.params.id], (err, data) => {
		if(err) return next(err);
		var tweetsWithThatId = data.rows;
		res.render("index", {
			title: "Twitter.js",
			tweets: tweetsWithThatId, // un arreglo de solo un elemento ;-)
		});
	})
});

// crear un nuevo tweet
router.post("/tweets", function (req, res, next) {
	const variables = [req.body.name, req.body.content]
	const exist = client.query('SELECT * FROM users WHERE users.name = $1', [variables[0]], (err, data) => {
		if(err) return next(err);
		return data.rows.length !== 0;
	})
	if(exist){
		client.query("INSERT INTO tweets (user_id, content) VALUES ((SELECT id from users where name = $1), $2)", variables, (err, data) => {
			if(err) return next(err);
			res.redirect("/");
		})
	} else {
		//
		client.query("INSERT INTO users (name, picture_url) VALUES ($1, 'http://i.imgur.com/JKInSVz.jpg');", [variables[0]], (err, data) => {
			if(err) return next(err);
		})

		client.query("INSERT INTO tweets (user_id, content) VALUES ((SELECT id from users where name = $1), $2)", variables, (err, data) => {
			if(err) return next(err);
			res.redirect("/");
		})
	}




	//INSERT INTO tweets (user_id, content) VALUES ((SELECT id from users where name='Kanye West'),          'I think what Kanye West is going to mean is something similar to what Steve Jobs means.');
});

// // reemplazá esta ruta hard-codeada con static routing general en app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });
