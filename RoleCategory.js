exports.RoleCategories = {
  _byName: {
    ligues: 1752220,
    pronoms: 15158332,
  },
  humanReadable: function () {
    return this._byName;
  },
  discordReadable: function () {
    const result = {};
    Object.keys(this._byName).forEach((key) => {
      result[this._byName[key]] = key;
    });
    return result;
  },
};
