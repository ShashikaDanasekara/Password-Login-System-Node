if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override')

const initPassport = require('./passport-config');
initPassport(
    passport, 
    (email) => {return users.find(user => user.email === email)},
    (id) => {return users.find(user => user.id === id)}
);

const users = []

app.set('app-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthUser , (req,res) =>{
    res.render('index.ejs',{ name: req.user.name })
})

app.get('/login', checkNonAuthUser, (req,res) =>{ 
    res.render('login.ejs')
})
app.post('/login', checkNonAuthUser, passport.authenticate('local',{
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
}))

app.get('/register', checkNonAuthUser, (req,res) =>{
    res.render('register.ejs')
})

app.post('/register',checkNonAuthUser, async (req,res) =>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        res.redirect('/login')
    }
    catch{
        res.redirect('/register')
    }
    
    console.log(users)
})

app.delete('/logout', (req, res)=>{
    req.logOut()
    res.redirect('/login')
})

function checkAuthUser(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNonAuthUser(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    return next()
}


app.listen(3000);