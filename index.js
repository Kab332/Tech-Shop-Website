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

app.use(bodyParser.json());

//configure the template engine
app.set("views", __dirname + "/views");
app.set("view engine", "pug");

//configure sessions
app.use(
    session({
        genid: function (req) {
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
    username: {
        type: String,
        unique: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        index: true
    },
    hashedPassword: String,
    address: String,
    country: String,
    province: String,
    city: String,
    zip: String
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
        type: String,
        default: Date.now
    }
}, {
    collection: "items"
});

var Item = mongoose.model('item', itemSchema);

//calls landing page
app.get("/", function (req, res) {
    // req.session.username = 'admin';
    username = req.session.username;
    res.render("index", {
        title: "Index",
        description: "This is the main page",
        username: username,
        tableItems: []
    })
});

function reloadItemList(req, res, resMessage) {
    Item.find()
        .then(function (results) {
            res.render("items", {
                title: "Items List",
                items: results,
                resMessage: resMessage
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

app.get("/items", function (req, res) {
    username = req.session.username;
    reloadItemList(req, res, "");
});
// app.get('/items/all', function (req, res) {
//     Item.find({}).then(function (err, item) {
//         if (err)
//             res.send(err);
//         res.json(item);
//     });
// });

app.get("/items/:id", function (req, res) {
    console.log(req.params.id);
    var id = req.params.id;
    var query;
    if (id == 'ALL') {
        query = Item.find({});
    } else {
        query = Item.find({
            name: req.params.id
        });
    }
    if (query == '' || query == 'undefinded') {
        console.error('somthing bad happened');
    } else {
        query.exec(function (err, item) {
            if (err)
                res.send(err);
            res.json(item);
        });
    }
});
// app.get("/users/:id", function (req, res) {
//     User.find({
//         name: req.params.id
//     }).then(function (err, item) {
//         if (err)
//             res.send(err);
//         res.json(item);
//     });
// });

app.get("/users/:id", function (req, res) {
    console.log(req.params.id);
    var id = req.params.id;
    var query;
    if (id == 'ALL') {
        query = User.find({});
    } else {
        query = User.find({
            username: req.params.id
        });
    }
    if (query == '' || query == 'undefinded') {
        console.error('somthing bad happened');
    } else {
        query.exec(function (err, item) {
            if (err)
                res.send(err);
            res.json(item);
        });
    }
});

// app.get('/users/all', function (req, res) {
//     User.find({}).then(function (err, item) {
//         if (err)
//             res.send(err);
//         res.json(item);
//     });
// });

app.get('/user', function (req, res) {
    res.render("users", {
        title: "users",
        message: "test user page"
    });
});

function queryItemByName(name) {
    return Item.find({
        name: name
    });
}

function queryUserByUserName(name) {
    return User.find({
        username: name
    });
}

function queryUserByEmail(name) {
    return User.find({
        email: name
    });
}

app.get('/admin', function (req, res) {
    username = req.session.username;
    if (username === 'admin') {
        console.log(req.headers.referer);
        res.render("admin", {
            title: "admin",
            description: "Displaying all items.",
            username: username
        });
    } else {
        Item.find({}).then(function (results) {
            res.render("index", {
                title: "Index",
                description: "Displaying all items.",
                username: username,
                tableItems: results
            });
        });
    }
});

app.post('/search', function (req, res) {
    username = req.session.username;
    if (req.body.searchValue == "all") {
        Item.find({}).then(function (results) {
            res.render("index", {
                title: "Index",
                description: "Displaying all items.",
                username: username,
                tableItems: results
            });
        });
    } else {
        Item.find({
            name: {
                "$regex": req.body.searchValue,
                "$options": "i"
            }
        }).then(function (results) {
            var text = "";
            if (results.length == 0) {
                text = "No items were found.";
            } else if (results.length > 1) {
                text = "Multiple items have been found!";
            } else if (results.length > 0) {
                text = "An item has been found!";
            }
            res.render("index", {
                title: "Index",
                description: text,
                username: username,
                tableItems: results
            });
        });
    }
});

app.post('/addItem', function (req, res) {
    var newItem = new Item({
        name: req.body.name,
        quantity: req.body.quantity,
        date: req.body.date
    });
    queryItemByName(newItem.name).exec(function (err, result) {
        if (err)
            console.error(err);
        if (result.length == 0) {
            newItem.save(function (error) {
                if (error) {
                    // insert failed
                    console.log('error while adding item:', error);
                    reloadItemList(req, res, 'Unable to add item');
                } else {
                    // insert successful
                    // reloadItemList(req, res, 'Item added');
                    res.render("admin", {
                        title: "admin",
                        resMessage: newItem.name + " added"
                    });
                }
            });
        } else {
            // res.redirect(req.headers.referer);
            res.render("admin", {
                title: "admin",
                resMessage: "Item " + newItem.name + " already exists"
            });

            // res.send(req.headers);
        }
    });
});

app.post('/addToCart', function (req, res) {
    var data = {
        name: req.body.name,
        quantity: req.body.quantity,
    };

    console.log(req);

    console.log("\nCurrent: " + req.session.cart);

    if (req.session.cart == undefined) {
        req.session.cart = "[" + JSON.stringify(data);
    } else {
        req.session.cart += ", " + JSON.stringify(data);
    }

    console.log("\nAfter: " + req.session.cart);

    res.render("index", {
        title: "Index",
        description: req.body.name + " has been added to cart",
        username: req.session.username,
        tableItems: JSON.parse(req.body.tableItems)
    })
});

app.post('/updateItems', function (req, res) {
    username = req.session.username;
    var resultMessage = "";
    var rows = req.body.rows;
    var errorCount = 0, successCount = 0;

    Item.find({}).then(function (results) {
        for (var i = 0; i < results.length; i++) {
            var newData = {
                name: rows[i].name,
                quantity: rows[i].quantity,
                date: rows[i].date
            };

            Item.updateOne({
                    name: results[i].name
                },
                newData,
                function (error, num) {
                    if (error != null) {
                        resultMessage = "Successful for " + successCount + " row(s)\nError for " + (errorCount + 1) + " row(s)";
                        errorCount++;
                        if ((errorCount + successCount) == (results.length)) { 
                            res.json(resultMessage); 
                        }
                    } else {
                        resultMessage = "Successful for " + (successCount + 1) + " row(s)\nError for " + errorCount + " row(s)";
                        successCount++;
                        if ((errorCount + successCount) == (results.length)) { 
                            res.json(resultMessage); 
                        }
                    }
                }
            );
        }
    });
});

app.post('/removeItem', function (req, res) {
    name = req.body.name;
    Item.remove({
        name: name
    }, function (error) {
        if (error) {
            reloadItemList(req, res, 'Unable to delete item');
        } else {
            reloadItemList(req, res, 'Item deleted');
        }
    });
});

app.post('/removeAllItems', function (req, res) {
    console.log('Reached');
    Item.remove({}, function (error) {
        if (error) {
            reloadItemList(req, res, 'Unable to remove all items');
        } else {
            reloadItemList(req, res, 'All items removed.');
        }
    });
});

app.get("/about", function (req, res) {
    username = req.session.username;
    res.render("about", {
        title: "About"
    });
});

app.get("/login", function (req, res) {
    username = req.session.username;
    console.log(req.headers);
    res.render("login", {
        title: "Login"
    });
});

//used for form submission
app.post("/processLogin", function (req, res) {
    console.log("/processLogin (POST): username: " + req.body.username);
    //check if admin credentials
    if (req.body.username === "admin" && req.body.password === "admin") {
        var username = req.body.username;
        req.session.username = username;

        res.render("index", {
            title: "Hello",
            description: "",
            username: username,
            tableItems: []
        });
        console.log(username);
    } else {
        //check if its valid user name
        queryUserByUserName(req.body.username).exec(function (err, result) {
            if (err) {
                console.error(err);
            }
            //username doesnt exist
            if (result.length == 0 || req.body.password != result[0].hashedPassword) {
                res.render("login", {
                    title: "Login Page",
                    errorMessage: "Login Incorrect.  Please try again.",
                    loginError: true
                });
            } else if (result.length > 1) {
                console.error("server error");
            } else {
                var username = req.body.username;
                req.session.username = username;

                res.render("index", {
                    title: "Hello",
                    description: "",
                    username: username,
                    tableItems: []
                });
            }
        });
        // // login failed
        // res.render("login", {
        //     title: "Login Page",
        //     errorMessage: "Login Incorrect.  Please try again."
        // });
    }
});

// Signout get
app.get("/signout", function (req, res) {
    req.session.username = undefined;
    res.render("index", {
        title: "Index",
        description: "You have signed out.",
        username: undefined,
        tableItems: []
    });
});

app.get("/register", function (req, res) {
    username = req.session.username;
    res.render("register", {
        title: "Register"
    });
});

app.post("/processRegistration", function (req, res) {
    // res.send(req.body);
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        hashedPassword: req.body.pwd,
        address: req.body.address,
        country: req.body.country,
        province: req.body.state,
        city: req.body.city,
        zip: req.body.zip
    });
    queryUserByUserName(newUser.username).exec(function (err, result) {
        //username already exists
        if (result.length > 0) {
            res.render("register", {
                title: 'register',
                errorMessage: 'user with that name already exists',
                registerError: true
            });
        } else {
            newUser.save(function (err) {
                if (err) {
                    console.log(err)
                } else {
                    var username = newUser.username;
                    req.session.username = username;

                    res.render("index", {
                        title: "Hello",
                        description: "",
                        username: username,
                        tableItems: []
                    });
                }
            });
        }
    });
});

app.get('/cart', function (req, res) {
    username = req.session.username;
    var cart = [];

    if (req.session.cart != undefined) {
        cart = JSON.parse(req.session.cart + ']');
    }

    res.render('cart', {
        title: 'Cart',
        description: 'There are ' + cart.length + ' item(s) in the cart',
        username: username,
        tableItems: cart
    })
});

app.get("/dummymessage", function (req, res) {
    res.send("Hello from Node.js and Express");
});

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), function () {
    console.log("Server listening on port " + app.get("port"));
});