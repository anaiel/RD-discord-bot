const fs = require("fs");

exports.newMemberHandler = function (member) {
  fs.readFile("./welcome-message.txt", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    member.send(data);
  });
};
