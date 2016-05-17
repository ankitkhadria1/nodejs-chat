var http = require('http'),
	express = require('express'),
	chatServer = require('./lib/chat-server'),
	db = require('./db.js'),
	bodyParser = require('body-parser');
var _ = require('underscore');
var chatHistory = require('./routes/chat.js');

var app = express();
app.use(bodyParser.urlencoded({
	extended: true
}));
/*var admin = [];
var supplierAdmin = [];*/

app.use(bodyParser({
	defer: true
}));

app.set('view engine', 'ejs');
app.set('views', './views');


app.use(bodyParser.json());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app).listen('9000', 'localhost');
chatServer.listen(server); //running chat server

/*sql = ' select email from admin ';
// sub admin
db.query(sql, function(err, result) {
	if (err)
		console.log('err===while rettriving admin');
	else {
		// result.forEach( function(element) {
		// 	// statements
		// 	admin.push(element.email);
		// });
		_.each(result, function(item) {


			admin.push(item.email);

		})

		console.log('result admin email', result);
	}
});

// supplier sub admin
sql = ' select email from user ';
db.query(sql, function(err, result) {
	if (err)
		console.log('err===while rettriving supplier admin');
	else {
		// result.forEach( function(element) {
		// 	// statements
		// 	admin.push(element.email);
		// });
		_.each(result, function(item) {


			supplierAdmin.push(item.email);

		})

		console.log('result admin email', result);
	}
});*/
app.get('/', function(req, res) {

	res.render('signin.ejs');
});

app.post('/signIn', function(req, res) {
	var email = req.body.email;
	var pass = req.body.pass;
	var is_admin = req.body.isAdmin;
	q = 'select * from user where email=?';

	db.query(q, [email], function(err, result) {
		if (result.length > 0) {

			
			console.log(result[0].pass);
			if (result[0].password == pass) {
				res.render('index1.ejs', {
					result: result[0] , admin : is_admin
				});

			}

		} else {
			console.log('no user exist');
			res.redirect('/signup');
		}
	})

});

app.get('/signup', function(req, res) {

	res.render('signup.ejs');

})

app.post('/signUp', function(req, res) {

	console.log(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var pass = req.body.pass;
	q = 'insert into user(name,email,password) value("' + name + '","' + email + '","' + pass + '")';
	db.query(q);


	res.redirect('/');
});


// app.get('/', function(req, res){
// 	res.sendfile(__dirname + '/views/index.html');
// });


app.post('/showOldChat', chatHistory.showOldChat);

function chat(result) {

	res.render('index1.ejs', {
		result: JSON.stringify(result)
	});

}