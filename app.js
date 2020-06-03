const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const places = require('./routes/placesRoutes');
const users = require('./routes/usersRoutes')
const uptimeLog = require('./util/uptimeLog');
const { URI, options } = require('./dbcreds');
const { invalidRoute, unknownError } = require('./util/routeErrors');
const listenPort = 3002;

const app = express();

app.use(bodyParser.json())

app.use('/uploads/images', express.static(`${__dirname}/uploads/images/`))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/places', places);

app.use('/api/users', users);

app.use(invalidRoute);

app.use(unknownError);

mongoose.connect(URI, options)
  .then(() => app.listen(listenPort, uptimeLog(listenPort)))
  .then(() =>
    console.log(`Connected to ${mongoose.connections[0].name} database
    on host: ${mongoose.connections[0].host}`))
  .catch(err => console.log(err));



