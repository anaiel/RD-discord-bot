const { handleError } = require("./handleError.js");

exports.messageHandler = function (msg) {
  if (msg.content.charAt(0) !== "!") return;

  const command = parseMsg(msg.content);
  const availableCommands = {
    aide: handleHelp,
    créer: handleCreate,
    liste: handleList,
    role: handleRole,
  };

  if (!availableCommands[command[0]]) {
    handleError(msg, undefined, "Je ne connais pas cette commande.");
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

  if (
    !command[0] ||
    !Object.values(availableCategories).find(
      (category) => category === command[0]
    )
  ) {
    let reply = "";
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
    handleError(msg, undefined, reply);
    return;
  }

  let reply = "";
  const roles = msg.guild.roles.cache
    .filter((role) => availableCategories[role.color] === command[0])
    .map((role) => role.name);
  reply += `**${command[0]}** : ${roles.join(", ")}\n`;
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
- \`!role nom-du-role nom-d'un-autre-role\` : ajouter un/des rôles (à soi même).
- \`!créer nom-de-la-categorie nom-du-role\` : créer un rôle.
  `;
  msg.reply(helpMsg);
}

function handleRole(msg, command) {
  const roles = [];
  const rejectedRoleNames = [];

  command.forEach((item) => {
    const role = msg.guild.roles.cache.find((role) => role.name === item);
    if (role) roles.push(role);
    else rejectedRoleNames.push(item);
  });

  if (rejectedRoleNames.length) {
    let rejectedMessage = `Le${rejectedRoleNames.length > 1 ? "s" : ""} role${
      rejectedRoleNames.length > 1 ? "s" : ""
    } ${rejectedRoleNames.join(", ")} n'existe${
      rejectedRoleNames.length > 1 ? "nt" : ""
    } pas.`;
    handleError(msg, undefined, rejectedMessage);
  }

  roles.forEach((role) => {
    msg.member.roles.add(role).catch((err) => {
      handleError(msg, err, `Le rôle ${role.name} n'a pas pu être ajouté.`);
    });
  });
}

function handleCreate(msg, command) {
  const availableCategories = {
    ligues: 1752220,
  };

  if (!availableCategories[command[0]]) {
    let errorMsg = `La catégorie ${
      command[0]
    } n'existe pas. Les catégories disponibles sont: ${Object.keys(
      availableCategories
    ).join(", ")}.`;
    handleError(msg, undefined, errorMsg);
    return;
  }
  if (!command[1]) {
    handleError(msg, undefined, "Veuillez préciser le nom de la ligue.");
    return;
  }

  const options = {
    data: {
      name: command[1],
      color: availableCategories[command[0]],
      mentionable: true,
    },
  };
  msg.guild.roles.create(options).catch((err) => {
    handleError(msg, err, "Le rôle n'a pas pu être créé");
  });
}
