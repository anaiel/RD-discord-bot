const { RoleCategories } = require("./RoleCategory");

exports.deleteAllRoles = function (msg, command) {
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
};
