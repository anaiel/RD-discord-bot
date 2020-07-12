exports.handleError = function (msg, err, userMsg) {
  if (err) {
    userMsg += " J'en appelle au @botdoctors !";
    console.log(err);
  }
  msg.reply(userMsg);
  msg.react("❌");
};
