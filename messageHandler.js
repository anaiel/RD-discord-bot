const { handleError } = require("./handleError.js");
const { handleSuccess } = require("./handleSuccess.js");
const { RoleCategories } = require("./RoleCategory.js");

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
  const availableCategories = RoleCategories.all();
  let requestedCategories = command[0]
    ? availableCategories.filter((availableCategory) =>
        command.find(
          (requestedCategory) => requestedCategory === availableCategory.name
        )
      )
    : [];

  let reply = "";
  if (requestedCategories.length === 0 && command[0])
    reply +=
      "La catégorie demandée n'existe pas. Voici tous les rôles disponibles : \n";
  if (requestedCategories.length === 0)
    requestedCategories = availableCategories;
  requestedCategories.forEach((category) => {
    reply += `**${category.name}** : `;
    reply +=
      msg.guild.roles.cache
        .filter((role) => role.color === category.color)
        .map((role) => role.name)
        .join(", ") || "aucun rôle existant";
    reply += "\n";
  });
  msg.reply(reply);
  return;
}

function handleHelp(msg, command) {
  const helpMsg = `
**Liste des commandes disponibles** :
- \`!aide\` : aide sur les commandes.
- \`!liste\` : liste les rôles disponibles. Il est possible de réclamer une catégorie en particulier avec \`!liste nom-de-la-catégorie\`.
- \`!role nom-du-role nom-d'un-autre-role\` : ajouter un/des rôles (à soi même).
- \`!créer nom-de-la-categorie nom-du-role\` : créer un rôle.
En cas de problème, ou pour ajouter des catégories ou des fonctionnalités, appelez les \`@botdoctors\`!
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

  msg.member.roles
    .add(roles)
    .then(() => {
      handleSuccess(msg);
    })
    .catch((err) => {
      handleError(msg, err, "Un rôle n'a pas pu être ajouté.");
    });
}

function handleCreate(msg, command) {
  if (!command[1]) {
    handleError(
      msg,
      undefined,
      `Veuillez préciser${
        command[0] ? " une catégorie et" : ""
      } le(s) rôle(s) à créer.`
    );
    return;
  }

  const availableCategories = RoleCategories.all();
  const requestedCategory = availableCategories.find(
    (availableCategory) => availableCategory.name === command[0]
  );
  if (!requestedCategory)
    handleError(
      msg,
      undefined,
      `La catégorie ${command[0]} n'existe pas. Utilisez \`!liste\` pour voir toutes les catégories.`
    );

  const requestedRoles = command.slice(1);
  requestedRoles.forEach((requestedRole) => {
    const options = {
      data: {
        name: requestedRole,
        color: requestedCategory.color,
        mentionable: requestedCategory.mentionable,
        permissions: requestedCategory.permissions,
      },
    };
    msg.guild.roles
      .create(options)
      .then(() => handleSuccess(msg))
      .catch((err) => {
        handleError(msg, err, `Le rôle ${requestedRole} n'a pas pu être créé.`);
      });
  });
}
