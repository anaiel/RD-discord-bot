exports.handleError = function (msg, err, userMsg) {
  if (err) console.log(err);
  msg.reply(userMsg);
};
