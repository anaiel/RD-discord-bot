/**
 * Roles are sorted by categories, which are artificially differentiated on
 * Discord by color.
 * New categories can be added by adding an item to the _data array:
 *   - name should be unique
 *   - color should be unique
 *   - mentionable should be a boolean corresponding to whether or not the
 *     roles in the category should be taggable by everyone
 *   - permissions should be an integer calculated with
 *     https://discordapi.com/permissions.html (use the standard 1144114257 if
 *     not creating a role with special privileges)
 */
exports.RoleCategories = {
  _data: Object.freeze([
    Object.freeze({
      name: "ligues",
      color: 1752220,
      mentionable: true,
      permissions: 1144114257,
    }),
    Object.freeze({
      name: "pronoms",
      color: 15158332,
      mentionable: false,
      permissions: 1412549713,
    }),
  ]),
  all: function () {
    return this._data;
  },
  names: function () {
    return this._data.map((category) => category.name);
  },
};
