var express = require('express')
var session = require('express-session')
var hbs = require('hbs')
var bodyparser = require('body-parser')
var mongodb = require('mongodb')
var multiparty = require('multiparty')

var app = express()
app.use(express.static('public'))
app.use(express.static('uploads'))
app.set('view engine', 'hbs')
app.use(session({
    secret: 'qwertyuiop',
    cookie: {
        maxAge: 1000 * 60 * 60,
        path: "/",
        httpOnly: true

    }
}))

app.use(bodyparser.urlencoded({
    extended: false
}))

var url = 'mongodb://localhost:27017'
var dbname = 'social'
var DB = ''

mongodb.MongoClient.connect(url, function (err, client) {
    if (err) {
        console.log(err)
    }
    else {
        DB = client.db(dbname)
    }
})

app.get('/', function (req, res) {
    res.render('login', {
        nouser: req.query.nouser,
        incorrectpassword: req.query.incorrectpwd
    })
})

app.get('/signup', function (req, res) {
    res.render('signup', {
        alreadyexists: req.query.alreadyexists
    })
})


app.post('/usersignup', function (req, res) {
    var form = new multiparty.Form({ uploadDir: 'uploads' })
    form.parse(req, function (err, fields, files) {
        var data = {
            name: fields.name[0],
            email: fields.email[0],
            birthdate: fields.birthdate[0],
            password: fields.password[0]
        }
        DB.collection('users').findOne({ email: fields.email[0] }, function (err, result) {
            console.log(err, result)
            if (result == null) {
                DB.collection('users').insertOne(data, function (err, result) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.redirect('/')
                    }
                })
            }
            else {
                res.redirect('/signup?alreadyexists=true')
            }
        })

    })

})

app.post('/userlogin', function (req, res) {
    DB.collection('users').findOne({ email: req.body.email }, function (err, result) {
        if (result == null) {
            var nouser = true
            res.redirect('/?nouser=true')
        }
        else {
            if (req.body.password == result.password) {
                req.session.user = {
                    email: result.email
                }
                res.redirect('/profile')
            }
            else {
                res.redirect('/?incorrectpwd=true')
            }
        }
    })
})

app.use(function (req, res, next) {
    if (req.session.user) {
        next();
    }
    else {
        res.redirect("/?loginfirst=true")
    }
})
app.get('/profile', function (req, res) {
    DB.collection('users').findOne({ email: req.session.user.email }, function (err, result) {
        if (err) {
            console.log(err)
        }
        else {
            res.render('profile', {
                user: result
            })
        }
    })

})

app.get('/logout', function (req, res) {
    req.session.destroy()
    res.redirect('/?loggedout=true')
})



app.post('/userupdate', function (req, res) {
    console.log('hello')
    var form1 = new multiparty.Form({ uploadDir: 'uploads' })
    form1.parse(req, function (err, fields, files) {
        console.log(err)
        var pic = files.photo[0]
        var data = {
            name: fields.name[0],
            status: fields.status[0],
            birthdate: fields.birthdate[0],
            location: fields.location[0],
            phone: fields.phone[0],
            hobbies: fields.hobbies[0],
            about: fields.about[0]
        }
        if (pic.size != 0) {
            data.photo=pic.path.replace('uploads\\','')
        }
        DB.collection('users').updateOne({ email: req.session.user.email }, { $set: data }, function (err, result) {
            if (err) {
                console.log(err)
            }
            else {
                res.redirect('/profile?updated=true')
            }
        })

    })
})

app.listen(5000)