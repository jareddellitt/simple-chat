var User = require('./users').User,
    GoogleStrategy = require('passport-google').Strategy, 
    crypto = require('crypto'),
    passport = require('passport');

function createGravatarFrom(email) {
    var hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
    return 'http://www.gravatar.com/avatar/' + hash + '?s=100&d=mm&r=g';
}

function createUserFrom(id, profile) {
    return new User({
        id: identifier,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        loggedIn: true,
        gravatar: createGravatarFrom(profile.emails[0].value)
    });
}

function lookupUser(identifier, profile, done) {
    User.findOne({ id: identifier }, function (err, user) {
        if (!user) {
            var u = createUserFrom(identifier, profile);

            u.save(function (err) {
                if (!err) {
                    done(null, { id: identifier });
                }
            });

        } else {
            done(null, { id: identifier });
        }
    });
}

var strategy = new GoogleStrategy({
    returnURL: 'http://10.0.0.17:3700/auth/google/return',
    realm: 'http://10.0.0.17:3700/'
}, lookupUser);

exports.createFrom = function (express) {
    passport.use(strategy);

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(obj, done) {  
        done(null, obj);
    });

    return passport;
};