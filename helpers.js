const findUserByEmail = (email, database) => Object.values(database).find(user => user?.email === email);

module.exports = {
  findUserByEmail
};