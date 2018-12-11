var express = require('express');
require('dotenv').load();	// Load the variables in the .env file, which is not uploaded to git
const mysql = require('mysql');
const bodyParser = require('body-parser');
var port = process.env.PORT || 8000
var hbs = require('express-handlebars');
var app = express();
var path = require('path');


const mysqlHost = process.env.MYSQL_HOST;
//const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlDBName = process.env.MYSQL_DATABASE;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPassword = process.env.MYSQL_PASSWORD;

const maxMySQLConnections = 10;


app.locals.mysqlPool = mysql.createPool({
	  connectionLimit: maxMySQLConnections,
	  host: mysqlHost,
	  database: mysqlDBName,
	  user: mysqlUser,
	  password: mysqlPassword
});

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static("public"));
app.use(bodyParser.json());
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/', require('./api'));

app.listen(port, function() {
	console.log("== Server is running on port", port);
});

app.use('*', function (req, res, next) {
	  res.status(404).json({
		      err: "Path " + req.originalUrl + " does not exist"
		    });
});


