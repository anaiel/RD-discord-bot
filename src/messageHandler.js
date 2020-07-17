const { handleError } = require("./commands/handleError.js");
const { handleSuccess } = require("./commands/handleSuccess.js");
const { RoleCategories } = require("./commands/RoleCategory.js");
const {
  handleCreate,
  handleHelp,
  handleList,
  handleRole,
  handleSuperCommand,
} = require("./commands/publicCommands");
const { deleteAllRoles } = require("./commands/privateCommands");

exports.messageHandler = function (msg) {
  if (msg.content.charAt(0) !== "!") return;

  const command = parseMsg(msg.content);
  const availableCommands = {
    aide: handleHelp,
    créer: handleCreate,
    liste: handleList,
    role: handleRole,
    deleteAllRoles: deleteAllRoles,
  };

  if (availableCommands[command[0]])
    availableCommands[command[0]](msg, command.slice(1));
  else if (RoleCategories.names().includes(command[0]))
    handleSuperCommand(msg, command);
  else handleError(msg, undefined, "Je ne connais pas cette commande.");
};

function parseMsg(msg) {
  return msg
    .slice(1)
    .split('"')
    .map((msgPart) => msgPart.trim())
    .reduce((commands, msgPart, i) => {
      if (!msgPart) return commands;
      if (i % 2 === 0) commands = [...commands, ...msgPart.split(" ")];
      else commands.push(msgPart.trim());
      return commands;
    }, []);
}
