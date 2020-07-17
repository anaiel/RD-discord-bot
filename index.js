require("dotenv").config();

const Discord = require("discord.js");
const bot = new Discord.Client();

const { messageHandler } = require("./src/messageHandler");
const { newMemberHandler } = require("./src/newMemberHandler");

bot.on("message", messageHandler);

bot.on("guildMemberAdd", newMemberHandler);

bot.login(process.env.TOKEN);
