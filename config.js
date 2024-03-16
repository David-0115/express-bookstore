/** Common config for bookstore. */




if (process.env.NODE_ENV === "test") {
  DB_NAME = `books-test`;
} else {
  DB_NAME = `books`;
}


module.exports = { DB_NAME };