const router = require('express').Router();
//const { addLodgingToUser, getUserByID } = require('./users');
let extFuncs = require('../public/rowEditter.js');

router.get('/', function(req, res, next){
	res.render('index', {title: 'Cool huh!', condition: true});
});

function validateLodgingObject(lodging) {
	  console.log(lodging.name, lodging.price, lodging.ownerid, lodging.street, lodging.city, lodging.state, lodging.zip, lodging.price);
	  return lodging && lodging.name && lodging.price && lodging.ownerid &&
		    lodging.street && lodging.city && lodging.state && lodging.zip &&
		    lodging.price;


}


function getLodgingsCount(mysqlPool) {
	return new Promise((resolve, reject) => {
		mysqlPool.query('SELECT COUNT(*) AS count FROM lodgings', function (err, results) {
		if (err) {
			reject(err);
		} else {
			resolve(results[0].count);
		}
		});
	});
}

function getLodgingsPage(page, totalCount, mysqlPool) {
	return new Promise((resolve, reject) => {
		const numPerPage = 10;
		const lastPage = Math.ceil(totalCount / numPerPage);
		page = page < 1 ? 1 : page;
		page = page > lastPage ? lastPage : page;
		const offset = (page - 1) * numPerPage;
		mysqlPool.query('SELECT * FROM lodgings ORDER BY id LIMIT ?,?', [offset, numPerPage], function (err, results) {
			if (err) {
				reject(err);
			} else {
				resolve({
					lodgings: results,
					pageNumber: page,
					totalPages: lastPage,
				        pageSize: numPerPage,
				        totalCount: totalCount
				});
			}
		});
	});
}


router.get('/lodgings', function (req, res) {
	const mysqlPool = req.app.locals.mysqlPool;
	getLodgingsCount(mysqlPool)
	.then((count) => {
		return getLodgingsPage(parseInt(req.query.page) || 1, count, mysqlPool);
	})
	.then((lodgingsPageInfo) => {
		lodgingsPageInfo.links = {};
		let { links, pageNumber, totalPages } = lodgingsPageInfo;
		if (pageNumber < totalPages) {
			links.nextPage = '/lodgings?page=' + (pageNumber + 1);
			links.lastPage = '/lodgings?page=' + totalPages;	
		}
		if (pageNumber > 1) {
			links.prevPage = '/lodgings?page=' + (pageNumber - 1);
			links.firstPage = '/lodgings?page=1';
		}
		var newVar = lodgingsPageInfo;
		console.log(newVar);
		res.render('lodgings', {lodgingsInfo: lodgingsPageInfo, update: false, table: true});  //the first param (lodgingsInfo) is what binds varibale and used to reference in view
		//res.status(200).json(lodgingsPageInfo);
	})
	.catch((err) => {
		console.log('  -- err:', err);
		res.status(500).json({
			error: "Error fetching lodgings list.  Please try again later."
		});
	});
});

function insertNewLodging(lodging, mysqlPool) {
	return new Promise((resolve, reject) => {
		const lodgingValues = {
			id: null,
			name: lodging.name,
			description: lodging.description,
			street: lodging.street,
			city: lodging.city,
			state: lodging.state,
			zip: lodging.zip,
			price: lodging.price,
			ownerid: lodging.ownerID
		};
		mysqlPool.query('INSERT INTO lodgings SET ?', lodgingValues, function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve(result.insertId);
			}
		});
	});
}

router.post('/lodgings', function (req, res, next) {
	const mysqlPool = req.app.locals.mysqlPool;
	if (req.body && req.body.name && req.body.price && req.body.ownerID) {
		insertNewLodging(req.body, mysqlPool)
		.then((id) => {
			res.redirect('lodgings');
			//res.render('lodgings', {lodgingsInfo: logings, update: false, table: true});
			//res.status(201).json({
			//	id: id,
			//	links: {
			//		lodging: '/lodgings/' + id
			//	}
		//	});
		})
		.catch((err) => {
			res.status(500).json({
				error: "Error inserting lodging."
			});
		});
	} else {
			res.status(400).json({
				error: "Request needs a JSON body with a name, a price, and an owner ID"
			});
	}
});


function getLodgingByID(lodgingID, mysqlPool) {
	return new Promise((resolve, reject) => {
		mysqlPool.query('SELECT * FROM lodgings WHERE id = ?', [ lodgingID ], function (err, results) {
			if (err) {
				reject(err);
			} else {
				console.log('results are ', results);
				resolve(results[0]); //results[0]
			}
		});
	});
}

router.get('/lodgings/:lodgingID', function (req, res, next) {
	const mysqlPool = req.app.locals.mysqlPool;
	const lodgingID = parseInt(req.params.lodgingID);
	getLodgingByID(lodgingID, mysqlPool)
	.then((lodging) => {
		if (lodging) {
			res.status(200).json(lodging);
		} else {
			next();
		}
	})
	.catch((err) => {
		res.status(500).json({
			lodgingID,
			error: "Unable to fetch lodging." 
		});
	});
});

router.get('/updateTable', function(req, res, next){
	console.log("editting ", req.query.id);
 	const mysqlPool = req.app.locals.mysqlPool;
	const lodgingID = parseInt(req.params.lodgingID);
	getLodgingByID(req.query.id, mysqlPool)
	.then((lodging) => {
		if (lodging) {
			console.log("in updateTable", lodging);
			res.render('lodgings', {lodgingsInfo: lodging, update: true, table: false});
		} else {
			next();
		}
	})
	.catch((err) => {
		res.status(500).json({
			lodgingID,
			error: "Unable to fetch lodging." 
		});
	});
});


router.get('/updateReturn', function(req, res, next){

	res.render('lodgings', {update: false, table: true});
});


function updateLodgingByID(lodgingID, lodging, mysqlPool) {
	console.log("in update lodging by id");
	return new Promise((resolve, reject) => {
		const lodgingValues = {
			name: lodging.name,
			description: lodging.description,
			street: lodging.street,
			city: lodging.city,
			state: lodging.state,
			zip: lodging.zip,
			price: lodging.price,
			ownerid: lodging.ownerid
		};
		console.log("the stuff is", lodgingValues);
	mysqlPool.query('UPDATE lodgings SET ? WHERE id = ?', [ lodgingValues, lodgingID ], function (err, result) {
		if (err) {
			reject(err);
		} else {
			resolve(result.affectedRows > 0);
		}
	});
	});
}

router.post('/lodgings_put/:lodgingID', function (req, res, next) {
	const mysqlPool = req.app.locals.mysqlPool;
	const lodgingID = parseInt(req.params.lodgingID);
	console.log('req body is', req.body);
	if (validateLodgingObject(req.body)) {
		updateLodgingByID(lodgingID, req.body, mysqlPool)
		.then((updateSuccessful) => {
			if (updateSuccessful) {
				res.redirect('/lodgings');
			} else {
				next();
			}
		})
	.catch((err) => {
		res.status(500).json({
			error: "Unable to update lodging."
		});
	});
	} else {
	res.status(400).json({
		err: "Request needs a JSON body with a name, a price, and an owner ID"
	});
	}

});

function deleteLodgingByID(lodgingID, mysqlPool) {
	return new Promise((resolve, reject) => {
		mysqlPool.query('DELETE FROM lodgings WHERE id = ?', [ lodgingID ], function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve(result.affectedRows > 0);
			}
		});
	});

}

router.post('/lodgings_delete/:lodgingID', function (req, res, next) {
	const mysqlPool = req.app.locals.mysqlPool;
	const lodgingID = parseInt(req.params.lodgingID);
	console.log("in lodging delete");
	deleteLodgingByID(lodgingID, mysqlPool)
	.then((deleteSuccessful) => {
		if (deleteSuccessful) {
			res.redirect("/lodgings");
			//res.status(204).end();
		} else {
			next();
		}
	})
	.catch((err) => {
		res.status(500).json({
			error: "Unable to delete lodging."
		});
	});
});

function getUsers(mysqlPool){
	return new Promise((resolve, reject) => {
		mysqlPool.query('SELECT * FROM lodgings_users', function (err, results) {
			if (err) {
				reject(err);
			} else {
				resolve(results);
			}
		});
	});
}


router.get('/users', function(req, res, next){
	const mysqlPool = req.app.locals.mysqlPool;
	getUsers(mysqlPool)
	.then((userInfo) => {
		var newuser = userInfo;
		console.log(userInfo);
		res.render('users', {userInfo: userInfo, update: false, table: true});
	})
	.catch((err) => {
		res.status(500).json({
			error: `unable to resolve`
		});
	});	
});



function insertNewUser(user, mysqlPool) {
	return new Promise((resolve, reject) => {
		const userValues = {
			ownerid: null,
			first_name: user.first_name,
			last_name: user.last_name,
			street: user.street,
			city: user.city,
			state: user.state,
			zip: user.zip
		};
		mysqlPool.query('INSERT INTO lodgings_users SET ?', userValues, function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve(result.insertId);
			}
		});
	});
}

router.post('/users', function (req, res, next) {
	const mysqlPool = req.app.locals.mysqlPool;
	console.log("in users post");
	if (req.body && req.body.first_name && req.body.last_name && req.body.street) {
		insertNewUser(req.body, mysqlPool)
		.then((id) => {
			res.redirect("/users");
		})
		.catch((err) => {
			res.status(500).json({
				error: "Error inserting user."
			});
		});
	} else {
			res.status(400).json({
				error: "Request needs a JSON body with a name, a price, and an owner ID"
			});
	}
});




function getLodgingsByOwnerID(ownerID, mysqlPool) {
	return new Promise((resolve, reject) => {
		mysqlPool.query('SELECT * FROM lodgings WHERE ownerid = ?',[ ownerID ],
			function (err, results) {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			}
		);
	});
}


router.get('/users/:userID/lodgings', function (req, res, next) {
	const mysqlPool = req.app.locals.mysqlPool;
	const ownerID = parseInt(req.params.userID);
	getLodgingsByOwnerID(ownerID, mysqlPool)
	.then((ownerLodgings) => {
		var newVar2 = ownerLodgings;
		console.log(newVar2);
	
		res.render('users', {ownerLodgings: ownerLodgings});

		//res.status(200).json({
		//	lodgings: ownerLodgings
		//});
	})
	.catch((err) => {
		res.status(500).json({
			error: `Unable to fetch lodgings for user ${ownerID}`
		});
	});

});


function getUserById(ownerid, mysqlPool){
	console.log("in get user by id. ownerid is ", ownerid);
	return new Promise((resolve, reject) => {
		mysqlPool.query('SELECT * FROM lodgings_users WHERE ownerid = ?', [ ownerid ],
			function (err, results) {
				if (err) {
					reject(err);
				} else {
					resolve(results[0]);
				}
			}
		);
	});
}


router.post('/users_put/:ownerid', function(req, res, next){
	const mysqlPool = req.app.locals.mysqlPool;
	const ownerid = parseInt(req.params.ownerid);
	console.log("id is ", ownerid);
	getUserById(ownerid, mysqlPool)
	.then((userInfo) => {
		res.render('users', {userInfo: userInfo, update: false, table: true});
	})
	.catch((err) => {
		res.status(500).json({
			error: `Unable to fetch stuff for user ${ownerid}`
		});
	});
});

router.get('/updateUsers', function(req, res, next){
 	const mysqlPool = req.app.locals.mysqlPool;
	const ownerid = parseInt(req.query.id);
	getUserById(ownerid, mysqlPool)
	.then((userInfo) => {
	if(userInfo){
		console.log("data is ", userInfo);
		res.render('users', {userInfo: userInfo, update: true, table: false});
	}
	else
		next();
	})
	.catch((err) => {
		res.status(500).json({
			error: "Unable to fetch userInfo" 
		});
	});
});




exports.router = router;
