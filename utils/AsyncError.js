// making error handling async

module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
