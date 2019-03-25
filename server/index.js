var express = require("express");
var app = express();

var session = require("express-session");
var bodyParser = require("body-parser");
var uuid = require("uuid/v1");
var mongoose = require("mongoose");

//database config
mongoose.Promise = global.Promise;
mongoose.connect(
    "mongodb://localhost/users", {
        useNewUrlParser: true
    },
    function (error) {
        if (error) {
            return console.error("Unable to connect:", error);
        }
    }
);
mongoose.set("useCreateIndex", true);

//middleware
app.use(express.static("public"));
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(
    "/bootstrap",
    express.static(__dirname + "/node_modules/bootstrap/dist/")
);
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist/"));

//configure the template engine
app.set("views", __dirname + "/views");
app.set("view engine", "pug");

//configure sessions
app.use(
    session({
        genid: function (request) {
            return uuid();
        },
        resave: false,
        saveUninitialized: false,
        secret: "apollo slackware prepositional expectations"
    })
);

var usernames = [];
var items = [];

// database schemas
var Schema = mongoose.Schema;
var userSchema = new Schema({
    uname: {
        type: String,
        unique: true,
        index: true
    },
    email: String,
    hashedPassword: String
}, {
    collection: "users"
});
var User = mongoose.model("user", userSchema);

var Schema = mongoose.Schema;
var itemSchema = new Schema({
    name: {
        type: String,
        unique: true,
        index: true
    },
    quantity: Number,
    date: {
        type: Date,
        default: Date.now
    }
}, {
    collection: "items"
});

var Item = mongoose.model('item', itemSchema);

//calls landing page
app.get("/", function (req, resp) {
    username = req.session.username;
    resp.render("index", {
        title: "Index",
        description: "This is the main page",
        username: username
    })
});

function reloadItemList(request, response, responseMessage) {
    Item.find()
        .then(function (results) {
            response.render("items", {
                title: "items List",
                items: results,
                responseMessage: responseMessage
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

app.get("/items", function (request, response) {
    reloadItemList(request, response, "");
});

// app.post("/addItem", function (req, resp) {
//     console.log(JSON.stringify(req.body));
//     // resp.send(req);

//     //itemDate
//     var newItem = new Item({
//         name: req.body.name,
//         quantity: req.body.quantity,
//         date: req.body.date
//     });

//     console.log("reached");

//     //checks if an item with that name already exists
//     Item.find({
//         name: req.body.name
//     }).then(function (err, items) {
//         if (err) return console.log(err);
//         //name exists
//         if (items.length != 0) {
//             console.log("Item exists");
//             reloadItemList(req, resp, 'Item with that name already exist');
//         }
//         //name doesnt exist 
//         else {
//             console.log("Item does not exist");
//             // //saves new item into database
//             newItem.save(function (error) {
//                 if (error) {
//                     // insert failed
//                     console.log('error while adding item:', error);
//                     reloadItemList(req, resp, 'Unable to add item');
//                 } else {
//                     // insert successful
//                     reloadItemList(req, resp, 'Item added');
//                 }
//             });
//         }
//     });

// });


app.post('/addItem', function (req, resp) {
    var newItem = new Item({
        name: req.body.name,
        quantity: req.body.quantity,
        date: req.body.date
    });
    newItem.save(function (error) {
        if (error) {
            // insert failed
            console.log('error while adding item:', error);
            reloadItemList(req, resp, 'Unable to add item');
        } else {
            // insert successful
            reloadItemList(req, resp, 'Item added');
        }
    });
});

app.post('/removeItem', function (req, resp) {
    name = req.body.name;
    Item.remove({
        name: name
    }, function (error) {
        if (error) {
            reloadItemList(req, resp, 'Unable to delete item');
        } else {
            reloadItemList(req, resp, 'Item deleted');
        }
    });
});

app.post('/removeAllItems', function (req, resp) {
    console.log('Reached');
    Item.remove({
    },  function(error) {
        if(error) {
            reloadItemList(req, resp, 'Unable to remove all items');
        } else {
            reloadItemList(req, resp, 'All items removed.');
        }
    });
});

app.get("/about", function (req, resp) {
    resp.render("about", {
        title: "About"
    });
});

app.get("/login", function (request, response) {
    response.render("login", {
        title: "Login"
    });
});
//called after the form is submited
app.get("/processLogin", function (req, resp) {
    // console.log(req.body);
    console.log("/processLogin (GET): username " + req.query.username);
});

//used for form submission
app.post("/processLogin", function (req, resp) {
    console.log("/processLogin (POST): username: " + req.body.username);
    if (req.body.username === "admin" && req.body.password === "admin") {
        var username = req.body.username;
        req.session.username = username;

        resp.render("index", {
            username: username,
            title: "hello"
        });
        console.log(username);
    } else {
        // login failed
        resp.render("login", {
            title: "Login Page",
            errorMessage: "Login Incorrect.  Please try again."
        });
    }
});

app.get("/register", function (request, response) {
    response.render("register", {
        title: "Register"
    });
});

app.post("/processRegistration", function (request, response) {
    var username = request.body.username;
    var password = request.body.pwd;

    if (userExists(username)) {
        response.render("register", {
            title: "Register",
            errorMessage: "Username in use"
        });
    } else {
        usernames.push(username);
        var u = new User({
            uame: username,
            hashedPassword: password
        });
        u.save(function (error) {
            if (error) {
                // insert failed
                console.log("error while adding student:", error);
                reloadStudentList(request, response, "Unable to add student");
            } else {
                // insert successful
                request.session.username = username;

                response.render("registerConfirm", {
                    username: username,
                    title: "Welcome aboard!"
                });
            }
        });

        console.log("username: " + username);
        console.log("password: " + password);
    }
});

app.get("/dummymessage", function (req, resp) {
    resp.send("Hello from Node.js and Express");
});

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), function () {
    console.log("Server listening on port " + app.get("port"));
});