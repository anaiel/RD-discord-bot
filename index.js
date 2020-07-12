require("dotenv").config();

const Discord = require("discord.js");
const bot = new Discord.Client();

bot.on("ready", () => {
  console.log("RDBot est connecté.");
});

bot.on("message", (msg) => {
  if (msg.content === "Salut") msg.reply("Bonjour");
});

bot.login(process.env.TOKEN);
