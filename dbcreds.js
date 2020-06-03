const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cv19-places-orir6.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

const options = {
  useNewUrlParser: true,
  useFindAndModify: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

module.exports = {
  URI,
  options
};
