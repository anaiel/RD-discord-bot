require("dotenv").config();

const Discord = require("discord.js");
const bot = new Discord.Client();

const { messageHandler } = require("./messageHandler.js");

bot.on("ready", () => {
  console.log("RDBot est connecté.");
});

bot.on("message", messageHandler);

bot.login(process.env.TOKEN);
