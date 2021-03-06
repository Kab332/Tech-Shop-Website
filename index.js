//Importing all the required packages
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

// User database schemas
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
    zip: String,
    transactions: String
}, {
    collection: "users"
});
//user model
var User = mongoose.model("user", userSchema);

// Item database schemas
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
    },
    type: String,
    image: String
}, {
    collection: "items"
});
//Item model
var Item = mongoose.model('item', itemSchema);

//Renders the Landing page
app.get("/", function (req, res) {
    username = req.session.username;
    Item.find({}).then(function (results) {
        res.render("index", {
            title: "Index",
            description: "This is the main page",
            username: username,
            tableItems: results
        })
    });
});

//utility function to reaload admin page
function reloadAdmin(req, res, resMessage) {
    res.render("admin", {
        title: "admin",
        resMessage: resMessage,
        itemFlag: true
    });
}

//retuns apropriate item data as json
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


//retuns apropriate user data as json
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

/****** Utility query functions ******/
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

//used to rend admin page based on id passed
app.get('/admin/:id', function (req, res) {
    username = req.session.username;
    var id = req.params.id;
    if (username === 'admin') {
        if (id == "items" || id == "") {
            console.log(req.headers.referer);
            res.render("admin", {
                title: "admin",
                description: "Displaying all items.",
                username: username,
                itemFlag: true
            });
        } else {
            console.log(req.headers.referer);
            res.render("admin", {
                title: "admin",
                description: "Displaying all users.",
                username: username,
                itemFlag: false
            });
        }
    }
    //if someone trys to call the page without proper credentials, 
    //send them back to the landing page 
    else {
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

//Uses to query the database for the searched term and render the appropriate result
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

//Used to add a new Item into the database
app.post('/addItem', function (req, res) {
    var newItem = new Item({
        name: req.body.name,
        quantity: req.body.quantity,
        date: req.body.date,
        image: req.body.image
    });
    queryItemByName(newItem.name).exec(function (err, result) {
        if (err)
            console.error(err);
        //checks to see if an item with that name exists, if not the execute
        if (result.length == 0) {
            newItem.save(function (error) {
                if (error) {
                    console.log('error while adding item:', error);
                    reloadAdmin(req, res, 'Unable to add item');
                } else {
                    res.render("admin", {
                        title: "admin",
                        resMessage: newItem.name + " added",
                        itemFlag: true
                    });
                }
            });
        } else {
            res.render("admin", {
                title: "admin",
                resMessage: "Item " + newItem.name + " already exists"
            });
        }
    });
});

//used to add a new user to the database
app.post('/addUser', function (req, res) {
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        hashedPassword: req.body.hashedPassword,
        address: req.body.address,
        country: req.body.country,
        province: req.body.province,
        city: req.body.city,
        zip: req.body.zip
    });
    queryUserByUserName(newUser.name).exec(function (err, result) {
        if (err)
            console.error(err);
        //check to see if the username is free
        if (result.length == 0) {
            newUser.save(function (error) {
                if (error) {
                    // insert failed
                    console.log('error while adding item:', error);
                    reloadAdmin(req, res, 'Unable to add item');
                } else {
                    // insert successful
                    // reloadAdmin(req, res, 'Item added');
                    res.render("admin", {
                        title: "admin",
                        resMessage: newUser.name + " added",
                        itemFlag: true
                    });
                }
            });
        } else {
            res.render("admin", {
                title: "admin",
                resMessage: "Item " + newItem.name + " already exists"
            });
        }
    });
});

//addes the item to cart, which is dependant on the session
app.post('/addToCart', function (req, res) {
    var data = {
        name: req.body.name,
        quantity: req.body.quantity,
    };

    //if no data in the cart create data array
    if (req.session.cart == undefined) {
        req.session.cart = [data];
    }
    //else append data to existing data array 
    else {
        req.session.cart.push(data);
    }

    res.json("Received");
});

//Confirms all purchases of the cart and add user transaction
app.post('/makeTransaction', function (req, res) {
    var cart = req.session.cart;

    Item.find({}).then(function (results) {
        var items = {};
        var transactions;

        for (var k = 0; k < cart.length; k++) {
            var name = cart[k].name;
            var quantity = cart[k].quantity;

            if(items[name] != undefined) {
                items[name] = {quantity: parseInt(quantity, 10), count: items[name].count + 1}
            } else {
                items[name] = {quantity: parseInt(quantity, 10), count: 1};
            }
        }

        User.find({ username: req.session.username}).then(function (result) {
            var currentUser = result[0];
            transactions = JSON.parse(currentUser.transactions);

            for (item in items) {
                var status = "Purchased";

                for (var i = 0; i < items[item].count; i++) {
                    if ((items[item].quantity - (i + 1)) < 0) {
                        status = "Ordered";                        
                    }

                    var data = {
                        name: item,
                        status: status
                    };
                    transactions.push(data);                    
                }
            }

            currentUser.transactions = JSON.stringify(transactions);

            User.updateOne({
                    username: req.session.username
                },
                currentUser,
                function (error, num) {
                    if (error != null) {
                        res.render('cart', {
                            title: 'Cart',
                            description: 'Purchase unsuccessful: ' + error,
                            username: req.session.username,
                            tableItems: cart
                        });
                    } else {
                        req.session.cart = [];
                        res.render('cart', {
                            title: 'Cart',
                            description: 'Purchase Successful',
                            username: req.session.username,
                            tableItems: []
                        })
                    }
                });
        });

        for (item in items) {
            var quantityValue;

            if (items[item].quantity <= items[item].count) {
                quantityValue = 0;
            } else {
                quantityValue = items[item].quantity - items[item].count;
            }

            Item.updateOne({
                    name: item
                },
                {$set: {quantity: quantityValue}},
                function (error, num) {
                    if (error != null) {
                        console.log("Update item Failed");
                    } else {
                        console.log("Update item Successful");
                    }
                });            
        }
    });
});

//Updates all the items in the database with the ginve values
app.post('/updateItems', function (req, res) {
    username = req.session.username;
    var resultMessage = "";
    var rows = req.body.rows;
    var errorCount = 0,
        successCount = 0;

    Item.find({}).then(function (results) {
        for (var i = 0; i < results.length; i++) {
            var newData = {
                name: rows[i].name,
                quantity: rows[i].quantity,
                date: rows[i].date,
                type: rows[i].type
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
app.post('/updateUsers', function (req, res) {
    username = req.session.username;
    var resultMessage = "";
    var rows = req.body.rows;
    var errorCount = 0,
        successCount = 0;

    User.find({}).then(function (results) {
        for (var i = 0; i < results.length; i++) {
            var newData = {
                username: rows[i].username,
                email: rows[i].email,
                hashedPassword: rows[i].hashedPassword,
                address: rows[i].address,
                country: rows[i].country,
                province: rows[i].province,
                city: rows[i].city,
                zip: rows[i].zip
            };
            console.log(newData);
            User.updateOne({
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
    val = req.body.name;
    console.log(val);
    Item.deleteOne({
        name: val
    }, function (error) {
        if (error) {
            reloadAdmin(req, res, 'Unable to delete item');
        } else {
            reloadAdmin(req, res, 'Item deleted');
        }
    });
});

app.post('/removeAllItems', function (req, res) {
    Item.remove({}, function (error) {
        if (error) {
            reloadAdmin(req, res, 'Unable to remove all items');
        } else {
            reloadAdmin(req, res, 'All items removed.');
        }
    });
});

app.post('/removeUser', function (req, res) {
    val = req.body.username;
    User.deleteOne({
        name: val
    }, function (error) {
        if (error) {
            reloadAdmin(req, res, 'Unable to delete user');
        } else {
            reloadAdmin(req, res, 'User deleted');
        }
    });
});

app.post('/removeAllItems', function (req, res) {
    Item.remove({}, function (error) {
        if (error) {
            reloadAdmin(req, res, 'Unable to remove all items');
        } else {
            reloadAdmin(req, res, 'All items removed.');
        }
    });
});

app.post('/removeFromCart', function (req, res) {
    var cart = req.session.cart;

    // console.log(cart);
    // console.log(req.body.name);

    var index = cart.findIndex(obj => obj.name === req.body.name);
    if (index != undefined) {
        cart.splice(index, 1);
        if (cart.length == 0) {
            cart = [];
        }
        req.session.cart = cart;
    }

    res.render('cart', {
        title: 'Cart',
        description: 'There are ' + cart.length + ' item(s) in the cart',
        username: req.session.username,
        tableItems: cart
    })
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

app.get("/transactionHistory", function (req, res) {
    username = req.session.username;
    User.find({
        username: req.session.username
    }).then(function (result) {
        if(username != "admin") {
            var transactions = JSON.parse(result[0].transactions);
            res.render("transactionHistory", {
                description: "There are " + transactions.length + " item(s) in transaction history",
                tableItems: transactions
            });
        } else {
            res.render("transactionHistory", {
                description: "Admin accounts do not have transactions",
            });
        }
    });
});

//used for form submission
app.post("/processLogin", function (req, res) {
    console.log("/processLogin (POST): username: " + req.body.username);
    //check if admin credentials
    if (req.body.username === "admin" && req.body.password === "admin") {
        var username = req.body.username;
        req.session.username = username;

        Item.find({}).then(function (results) {
            res.render("index", {
                title: "Hello",
                description: "",
                username: username,
                tableItems: results
            });
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

                Item.find({}).then(function (results) {
                    res.render("index", {
                        title: "Hello",
                        description: "",
                        username: username,
                        tableItems: results
                    });
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
    Item.find({}).then(function (results) {
        res.render("index", {
            title: "Index",
            description: "You have signed out.",
            username: undefined,
            tableItems: results
        });
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
        zip: req.body.zip,
        transactions: "[]"
    });
    queryUserByUserName(newUser.username).exec(function (err, result) {
        //username already exists
        if (result.length > 0) {
            res.render("register", {
                title: 'register',
                errorMessage: 'user with that name already exists',
                registerError: true
            });
        } else if (newUser.username == "admin") {
            res.render("register", {
                title: 'register',
                errorMessage: 'Invalid Username',
                registerError: true
            });
        } else {
            console.log9("Reached");
            newUser.save(function (err) {
                if (err) {
                    console.log(err)
                } else {
                    var username = newUser.username;
                    req.session.username = username;

                    Item.find({}).then(function (results) {
                        res.render("index", {
                            title: "Hello",
                            description: "",
                            username: username,
                            tableItems: results
                        });
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
        cart = req.session.cart;
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