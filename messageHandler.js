const { handleError } = require("./handleError.js");

exports.messageHandler = function (msg) {
  if (msg.content.charAt(0) !== "!") return;

  const command = parseMsg(msg.content);
  const availableCommands = {
    aide: handleHelp,
    // créer: handleCreate,
    liste: handleList,
    // role: handleRole,
  };

  if (!availableCommands[command[0]]) {
    handleError(msg, "Je ne connais pas cette commande.");
    return;
  }
  availableCommands[command[0]](msg, command.slice(1));
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

function handleList(msg, command) {
  const availableCategories = {
    1752220: "ligues",
  };
  let reply = "";

  if (
    !command[0] ||
    !Object.entries(availableCategories).find(
      (category) => category === command[0]
    )
  ) {
    if (command[0])
      reply +=
        "La catégorie demandée n'existe pas. Voici tous les rôles disponibles : \n";
    const rolesByCategory = getAllRoles(
      msg.guild.roles.cache,
      availableCategories
    );
    Object.keys(rolesByCategory).forEach((category) => {
      reply += `**${category}** : ${rolesByCategory[category].join(", ")}\n`;
    });
  } else {
    const roles = msg.guild.roles.cache
      .filter((role) => availableCategories[role.color] === command[0])
      .map((role) => role.name);
    reply += `**${command[0]}** : ${roles.join(", ")}\n`;
  }

  msg.reply(reply);
}

function getAllRoles(roles, availableCategories) {
  const rolesByCategory = {};
  roles.forEach((role) => {
    const category = availableCategories[role.color] || "autre";
    if (!rolesByCategory[category]) rolesByCategory[category] = [role.name];
    else rolesByCategory[category].push(role.name);
  });
  return rolesByCategory;
}

function handleHelp(msg, command) {
  const helpMsg = `
**Liste des commandes disponibles** :
- \`!aide\` : aide sur les commandes.
- \`!liste\` : liste les rôles disponibles. Il est possible de réclamer une catégorie en particulier avec \`!liste nom-de-la-catégorie\`.
  `;
  msg.reply(helpMsg);
}
