require("dotenv").config();

const Discord = require("discord.js");
const bot = new Discord.Client();

const { messageHandler } = require("./messageHandler.js");
const { newMemberHandler } = require("./newMemberHandler.js");

bot.on("message", messageHandler);

bot.on("guildMemberAdd", newMemberHandler);

bot.login(process.env.TOKEN);
