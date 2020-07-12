const { handleError } = require("./handleError.js");

exports.messageHandler = function (msg) {
  if (msg.content.charAt(0) !== "!") return;

  const command = msg.content.slice(1).split(" ");
  const availableCommands = {
    // aide: handleHelp,
    // créer: handleCreate,
    // liste: handleList,
    // role: handleRole,
  };

  if (!availableCommands[command[0]]) {
    handleError(msg, "Je ne connais pas cette commande.");
    return;
  }
  availableCommands[command[0]](msg, command.slice(1));
};

function handleList(msg, command) {}
