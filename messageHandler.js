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
  let helpMsg = `
Bonjour ! Je suis le bot qui te permet d'ajouter les rôles correspondant à ta lique et à tes pronoms !
1. Utilise la commande \`!liste\` (ou \`!liste pronoms\` ou \`!liste ligues\`) pour vérifier si ta/tes ligue(s) et tes pronoms ont déjà été créés.
2. Utilise les commandes:
    * \`!pronoms\` + tes pronoms
    * \`!ligues\` + ta/tes ligues
   pour obtenir ces rôles. Attention à utiliser des guillemets si il y a des espaces (par exemple: \`!ligues "Les Quads de Paris"\`)

En cas de problème, appelle les @botdoctors.`;

  if (command[0] !== "tout")
    helpMsg += "\nUtilise `!aide tout` pour voir toutes les commandes.";
  else
    helpMsg += `
    
Toutes les commandes :
- \`!aide\` pour afficher ce message
- \`!liste ["nom de la catégorie"]\` pour afficher tous les rôles ou les rôles liés à une catéforie (ligues ou pronoms)
- \`!créer "nom de la catégorie" "nom du role" ["nom d'un autre role" ...]\` pour créer un.e/des pronoms ou ligues
- \`!role "nom du role" ["nom d'un autre role"]\` pour s'ajouter un rôle existant
- \`!"nom de la catégorie" "nom du role" ["nom d'un autre role"]\` pour s'ajouter un.e/des ligues ou pronoms existants ou pas
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

function deleteAllRoles(msg, command) {
  if (process.env.TEST_MODE !== "true") return;

  const categories = RoleCategories.colors();
  msg.guild.roles.cache.forEach((role) => {
    if (categories.includes(role.color))
      role
        .delete()
        .then(() => {
          console.log(`Role ${role.name} deleted successfully.`);
        })
        .catch((err) => {
          console.warn(`Role ${role.name} was not deleted: ${err}`);
        });
  });
}
