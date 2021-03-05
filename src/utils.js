// min, (max+1)
function getRandomInt(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

module.exports = {
  getRandomInt,
};
