import dotenv from 'dotenv';
import bluebird from 'bluebird';
import mongoose from 'mongoose'
dotenv.config();

const { MONGODB_URI, SECRET, NODE_ENV } = process.env;

import express from 'express';
const app = express();


//Database connection --
mongoose.Promise = bluebird;
let url = `${process.env.MONGO_URI}`
console.log("BD",url);
let opts = {
  useNewUrlParser : true, 
  connectTimeoutMS:20000, 
  useUnifiedTopology: true
  };

mongoose.connect(url,opts)
  .then(() => {
    console.log(`Succesfully Connected to theMongodb Database..`)
  })
  .catch((e) => {
    console.log(`Error Connecting to the Mongodb Database...`),
    console.log(e)
  })

// Session
import session from 'express-session';
import MongoSession from 'connect-mongodb-session';

const MongoStore = MongoSession(session);

app.use(session({
    url,
    resave: true,
    saveUninitialized: true,
    secret: SECRET,
    cookie: {
        maxAge: 10000,
        sameSite: NODE_ENV == 'development' ? 'lax' : 'strict',
    },
    rolling: true
}));

// Middleware para evitar que luego de hacer LogOut se pueda volver a la página de productos
// por estar guardada en la memoria caché del navegador:
import { cacheControl } from './middlewares/cache.middlewares.js';

// Middlewares
app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(express.static('public'))
    .use(cacheControl) // Tiene que ir antes de los middlewares de Passport y de los Routers
;

// Passport
import passport from 'passport';

app
    .use(passport.initialize())
    .use(passport.session());

// Handlebars
import handlebars from 'express-handlebars';
import path from 'path';
const __dirname = path.resolve();
app.engine(
    'hbs',
    handlebars({
        extname: '.hbs',
        defaultLayout: 'marcoDeslogueado.hbs',
        layoutsDir: __dirname + '/src/views/layouts',
        partialsDir: __dirname + '/src/views/partials',
    }),
)

app.set('views', './src/views')
app.set('view engine', 'hbs')

// Routers
import apiRouter from './routers/api.router.js';
import passportRouter from './routers/passport.router.js';
import viewsRouter from './routers/views.router.js';

app
    .use('/api', apiRouter)
    .use('/auth', passportRouter)
    .use('/', viewsRouter);

// Server y minimist
import minimist from 'minimist'
const options = {
    default: {
        port: 8080
    }
}
const { port } = minimist(process.argv.slice(2), options)
const server = app.listen(port, () => console.log(
    `Server en http://localhost:${port}`
));


server.on('error', err => console.log(err))