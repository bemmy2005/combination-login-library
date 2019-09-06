var User = require('../models/user');
const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
var async = require('async');
var debug = require('debug')('user');
// Display list of all Users.
exports.user_list = function(req, res, next) {

  User.find()
    .sort([['username', 'ascending']])
    .exec(function (err, list_users) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('user_list', { title: 'Users List', user_list: list_users });
    });

};
// Display detail page for a specific User.
exports.user_detail = function(req, res, next) {

    async.parallel({
        user: function(callback) {
            User.findById(req.params.id)
              .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.user==null) { // No results.
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('user_detail', { title: 'User Detail', user: results.user, user_books: results.users_books } );
    });

};

// Display User create form on GET.
exports.user_create_get = function(req, res, next) {
    res.render('user_form', { title: 'Create User'});
};

// Handle User create on POST.
exports.user_create_post = [

    // Validate fields.
    body('username').isLength({ min: 1 }).trim().withMessage('user name must be specified.')
        .isAlphanumeric().withMessage('user name has non-alphanumeric characters.'),
    body('password').isLength({ min: 1 }).trim().withMessage('Password name must be specified.')
        .isAlphanumeric().withMessage('Password has non-alphanumeric characters.'),
    body('userrole').isLength({ min: 1 }).trim().withMessage('Role name must be specified.')
        .isAlphanumeric().withMessage('Role has non-alphanumeric characters.'),
    // Sanitize fields.
    sanitizeBody('username').escape(),
    sanitizeBody('password').escape(),
    sanitizeBody('userrole').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('user_form', { title: 'Create User', user: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an User object with escaped and trimmed data.
            var user = new User(
                {
                    username: req.body.username,
                    password: req.body.password,
                    userrole: req.body.userrole
                });
            user.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new user record.
                res.redirect(user.url);
            });
        }
    }
];

// Display User delete form on GET.
exports.user_delete_get = function(req, res, next) {

    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user==null) { // No results.
            res.redirect('/catalog/users');
        }
        // Successful, so render.
        res.render('user_delete', { title: 'Delete User', user: results.user, user_books: results.users_books } );
    });

};

// Handle User delete on POST.
exports.user_delete_post = function(req, res, next) {

    async.parallel({
        user: function(callback) {
          User.findById(req.body.userid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.users_books.length > 0) {
            // User has books. Render in same way as for GET route.
            res.render('user_delete', { title: 'Delete User', user: results.user, user_books: results.users_books } );
            return;
        }
        else {
            // User has no books. Delete object and redirect to the list of users.
            User.findByIdAndRemove(req.body.userid, function deleteUser(err) {
                if (err) { return next(err); }
                // Success - go to user list
                res.redirect('/catalog/users')
            })
        }
    });
};


// Display User update form on GET.
exports.user_update_get = function (req, res, next) {

    User.findById(req.params.id, function (err, user) {
        if (err) { return next(err); }
        if (user == null) { // No results.
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('user_form', { title: 'Update User', user: user });

    });
};

// Handle User update on POST.
exports.user_update_post = [

    // Validate fields.
    body('username').isLength({ min: 1 }).trim().withMessage('user name must be specified.')
        .isAlphanumeric().withMessage('user name has non-alphanumeric characters.'),
    body('password').isLength({ min: 1 }).trim().withMessage('Password name must be specified.')
        .isAlphanumeric().withMessage('Password name has non-alphanumeric characters.'),
    body('userrole').isLength({ min: 1 }).trim().withMessage('Role must be specified.')
        .isAlphanumeric().withMessage('Role has non-alphanumeric characters.'),
    // Sanitize fields.
    sanitizeBody('username').escape(),
    sanitizeBody('password').escape(),
    sanitizeBody('userrole').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create User object with escaped and trimmed data (and the old id!)
        var user = new User(
            {
                username: req.body.username,
                password: req.body.password,
                userrole: req.body.userrole,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('user_form', { title: 'Update User', user: user, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(req.params.id, user, {}, function (err, theuser) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(theuser.url);
            });
        }
    }
];


exports.user_logout = function(err,req, res, next) {
  debug("logout()");
  req.session.loggedIn = false;
  res.redirect("/");
};
exports.user_login = function(err, req, res, next) {
  var { username, password } = req.body;
  if (req.body.username && user_checkUser(username, password)) {
    debug("login()", username, password);
    req.session.loggedIn = true;
    res.redirect("/login");
  } else {
    debug("login()", "Wrong credentials");
    res.render("login", { title: "Login Here", error: "Wrong credentials" });
  }
};

exports.user_checkUser = function(username, password) {
  debug("checkUser()", username, password);
  if (username === "admin" && password === "admin") return true;
  return false;
};

exports.user_checkLoggedIn = function(err, req, res, next) {
  if (req.session.loggedIn) {
    debug(
      "checkLoggedIn(), req.session.loggedIn:",
      req.session.loggedIn,
      "executing next()"
    );
    next();
  } else {
    debug(
      "checkLoggedIn(), req.session.loggedIn:",
      req.session.loggedIn,
      "rendering login"
    );
    res.render("login", { title: "User login" });
  }
};
