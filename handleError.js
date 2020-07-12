exports.handleError = function (msg, err, userMsg) {
  if (err) {
    userMsg += " J'en appelle au @botdoctor !";
    console.log(err);
  }
  msg.reply(userMsg);
  msg.react("❌");
};
