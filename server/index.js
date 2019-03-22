var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var uuid = require('uuid/v1');
var mongoose = require('mongoose');

//database config
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/users', {
    useNewUrlParser: true
}, function (error) {
    if (error) {
        return console.error('Unable to connect:', error);
    }
});
mongoose.set('useCreateIndex', true);

//middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));


//configure the template engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//configure sessions
app.use(session({
    genid: function (request) {
        return uuid();
    },
    resave: false,
    saveUninitialized: false,
    secret: 'apollo slackware prepositional expectations'
}));

var usernames = [];
//utility function
function userExists(toFind) {
    for (i = 0; i < usernames.length; i++) {
        if (usernames[i] === toFind) {
            return true;
        }
    }
    return false;
}
// database schemas
var Schema = mongoose.Schema;
var userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        index: true
    },
    email: String,
    hashedPassword: String
}, {
    collection: 'users'
});
var User = mongoose.model('user', userSchema);


//calls landing page
app.get('/', function (req, resp) {
    username = req.session.username;
    resp.render('index', {
        title: 'Index',
        description: 'This is the main page',
        username: username
    });
    // if (req.session.username) {
    //     resp.send('Permission granted!');
    // } else {
    //     resp.send('Unauthorized access!')
    // }
});

app.get('/about', function (req, resp) {
    resp.render('about', {
        title: 'About'
    });
});

app.get('/login', function (request, response) {
    response.render('login', {
        title: 'Login'
    });
});
//called after the form is submited
app.get('/processLogin', function (req, resp) {
    // console.log(req.body);
    console.log('/processLogin (GET): username ' + req.query.username);
});

//used for form submission
app.post('/processLogin', function (req, resp) {
    console.log('/processLogin (POST): username: ' + req.body.username);
    if (req.body.username === 'admin' && req.body.password === 'admin') {
        req.session.username = req.body.username;
        resp.send('Thanks for login in!');
    } else {
        resp.send('Unknown user detected');
    }
});

app.get('/register', function (request, response) {
    response.render('register', {
        title: 'Register'
    });
});

app.post('/processRegistration', function (request, response) {
    var username = request.body.username;
    var password = request.body.pwd;



    if (userExists(username)) {
        response.render('index', function (err, html) {
            console.log('user exists');
            console.log(usernames);
        });
    } else {
        usernames.push(username);

        request.session.username = username;

        response.render('registerConfirm', {
            username: username,
            title: 'Welcome aboard!'
        });

        console.log('username: ' + username);
        console.log('password: ' + password);
    }
});



app.get('/dummymessage', function (req, resp) {
    resp.send('Hello from Node.js and Express');
})

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + app.get('port'));
});

// app.use(function (request, response, next) {
//     console.log('REQUEST: url = ' + request.url);
//     next();
// });