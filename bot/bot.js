require("dotenv").config();

const TelegramBot =
require("node-telegram-bot-api");

const bot =
new TelegramBot(
  process.env.BOT_TOKEN,
  { polling:true }
);

const APP_URL =
"https://YOUR-VERCEL-APP.vercel.app";

bot.onText(/\/start/, (msg)=>{

  bot.sendMessage(
    msg.chat.id,

    "🌃 Welcome to SHADOW DREAM",

    {
      reply_markup:{
        inline_keyboard:[
          [
            {
              text:"🎮 Open Game",
              web_app:{
                url:APP_URL
              }
            }
          ]
        ]
      }
    }
  );

});

console.log("Bot Running...");
