const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const conn  = require('./Utils/database')
const session = require('express-session');
const MYSQLStore = require('express-mysql-session')(session);
const store = new MYSQLStore({},conn);
const storeRouter = require('./Routes/storeRouter');
const authRouter = require('./Routes/authRouter');
const hostRouter = require('./Routes/hostRouter');
require('dotenv').config();



app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'views'));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: store,
    resave: false,  
    saveUninitialized: false,
    cookie: { 
        maxAge:null,
        secure : false}
}))

app.use(authRouter);
app.use(storeRouter);
app.use(hostRouter);
app.use((req,resp,next) => {
    resp.status(404).render('404');
});


const port = 3000||process.env.PORT ;
app.listen(port,()=>{
 console.log(`http://localhost:${port}`)
})
