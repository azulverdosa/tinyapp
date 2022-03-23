const findUrlsForUserId = (userId, database) => {
  const arrOfUrlEntries = Object.entries(database);

  return arrOfUrlEntries.reduce((acc, [shortUrl, urlObj]) => {
    if (urlObj.userId === userId) {
      return { ...acc, [shortUrl]: urlObj };
    } else {
      return acc;
    }
  }, {});
};

const findUserByEmail = (email, database) =>
  Object.values(database).find((user) => user?.email === email);

const findUserById = (userId, database) => database[userId] || null;

const generateRandomString = () => Math.random().toString(36).slice(2, 8);

module.exports = {
  findUrlsForUserId,
  findUserByEmail,
  findUserById,
  generateRandomString,
};
