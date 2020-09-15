const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo")(session);
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const connectDB = require("./config/db");

// load config
dotenv.config({ path: "./config/config.env" });

// Passport Config
require("./config/passport")(passport);

connectDB();

const app = express();

//Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Method Override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// morgan for logging requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

//handlebars template engine for express app
app.engine(
  ".hbs",
  exphbs({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

//Sessions
app.use(
  session({
    secret: "keybaord cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Setting Global Variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//Static File
app.use(express.static(path.join(__dirname, "public")));
app.use("/stories", express.static(path.join(__dirname, "public")));
app.use("/stories/user", express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
