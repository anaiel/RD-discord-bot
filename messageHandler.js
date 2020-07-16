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
Bonjour ! Je suis le bot qui te permet d'ajouter les rôles correspondant à ta lique et à tes pronoms !
1 - Vérifie si la ligue et les pronoms on déjà été créés avec la commande \`!liste\` (ou \`!liste pronoms\` ou \`!liste ligues\`)
2 - Si ils existent déjà, tu peux t'ajouter les rôles avec \`!role\` + le nom du rôle (il faut utiliser des guillemets pour les noms avec des espaces)
3 - Si ils n'existent pas, tu peux les créer avec les commandes:
        * \`!créer ligues\` + les noms des ligues que tu veux créer (utilise des guillemets pour les noms avec des espaces, par exemple \`!créer ligues PRG "Quads de Paris"\`)
        * \`!créer pronoms\` + les pronoms que tu veux ajouter
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

  if (roles.length > 0)
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
  if (!requestedCategory) {
    handleError(
      msg,
      undefined,
      `La catégorie ${command[0]} n'existe pas. Utilisez \`!liste\` pour voir toutes les catégories.`
    );
    return;
  }

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

function handleSuperCommand(msg, command) {
  const category = RoleCategories.all().find(
    (availableCategory) => availableCategory.name === command[0]
  );

  command.slice(1).forEach((requestedRole) => {
    const role = msg.guild.roles.cache.find(
      (existingRole) => existingRole.name === requestedRole
    );

    if (role && role.color !== category.color) {
      handleError(
        msg,
        undefined,
        `Le rôle ${requestedRole} existe déjà dans une autre catégorie. Utilise la bonne catégorie ou change le nom du rôle.`
      );
      return;
    }

    if (!role) {
      msg.guild.roles
        .create({
          data: {
            name: requestedRole,
            color: category.color,
            mentionable: category.mentionable,
            permissions: category.permissions,
          },
        })
        .then((createdRole) => {
          console.log(requestedRole);
          msg.member.roles
            .add(createdRole)
            .then(() => {
              handleSuccess(msg);
            })
            .catch((err) => {
              handleError(
                msg,
                err,
                `Le role ${requestedRole} n'a pas pu être ajouté.`
              );
            });
        });
    } else {
      msg.member.roles
        .add(role)
        .then(() => {
          handleSuccess(msg);
        })
        .catch((err) => {
          handleError(
            msg,
            err,
            `Le role ${requestedRole} n'a pas pu être ajouté.`
          );
        });
    }
  });
}
