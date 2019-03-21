var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var uuid = require('uuid/v1');

//middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: false
}));

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