const fs = require("fs");

exports.newMemberHandler = function (member) {
  fs.readFile("./new-member/welcome-message.txt", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    if (typeof data === "string") member.send(data);
    else console.log("Error: Wrong welcome message: ", data);
  });
};
