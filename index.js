// Load up the discord.js library
const Discord = require("discord.js");
const superagent = require("superagent");
const fs = require("fs");
const ms = require("ms");

bot.login(process.env.token)

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity('over Qantas and Virgin Australia', { type: 'WATCHING' })
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }

  if(command === "serverinfo") {
    let sicon = message.guild.iconURL;
    let serverembed = new Discord.RichEmbed()
    .setDescription("Server Information")
    .setColor("#15f153")
    .setThumbnail(sicon)
    .addField("Server Name", message.guild.name)
    .addField("Created On", message.guild.createdAt)
    .addField("You Joined", message.member.joinedAt)
    .addField("Total Members", message.guild.memberCount);

    message.channel.send(serverembed);
}

if(command === "setup") {
  let setupE = new Discord.RichEmbed()
  .setTitle("Setup")
  .setAuthor(message.author.username)
  .setDescription("To be able to kick and ban or use admin commands with this bot, you need to have the role BotManager.Please create this role and assign to anyone to whom you want to give kick and ban permissions. A list of available commands may be told to you by -help.")
  .setColor("#FF9900")
  .setFooter("CubeBots")
  message.reply(setupE)
}

if(command === 'embed') {
const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{}); 
let customE = new Discord.RichEmbed()
.setDescription(sayMessage)
.setColor("#615D5C")
.setFooter(`CubeBots | Shouted by ${message.author.username}`)
message.channel.send(customE)
}

if(command === "avatar") {
let avatarE = new Discord.RichEmbed()
.setTitle("Oh! Here's your pfp! Like it? (click on me to view the pfp)")
.setDescription(`This is the avatar of ${message.author}`)
.setURL(message.author.avatarURL)
.setFooter("CubeBots")
.setAuthor(message.author.username)

message.reply(avatarE)

}

if(command === "help") {
let helpE = new Discord.RichEmbed()
.setTitle("Help")
.setDescription("Here are the list of commands")
.addField("ping", "Gives you the latency and time between sending and editing a message")
.addField("serverinfo", "Gives you info about the server")
.addField("say", "Make your bot talk")
.addField("setup", "Know how to setup")
.addField("embed", "Make your bot talk with an embed")
.addField("kick", "Do a swift kick in the nuts, so basically kick someone")
.addField("ban", "ban someone")
.addField("8ball", "fun, just ask a question with the command and you'll see")
.addField("purge", "clear a certain number of messages")
.addField("avatar", "know the pfp of someone lmfao")
message.channel.send(helpE)
}



  if(command === "kick") {
    if(!message.member.roles.some(r=>["BotManager"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }

  if(command === "8ball") {
    if(!args[2]) return message.reply ("Please ask a question!")
    let replies =  ["Yeah sure, that's great!", "No,that's bad", "Don't even think about it, just no nitwit.", "I don't know or I'm unsure retry", "Stop disturbing me ask again later", "Wait, I think that's true! Ur right noob! You're good atm!"]

    let result = Math.floor((Math.random() * replies.length));
    let question = args.slice(1).join(" ");

    let ballembed = new Discord.RichEmbed()
    .setAuthor(message.author.tag)
    .setColor("#FF9900")
    .addField("Question", question)
    .addField("Answer", replies[result])

    message.channel.send(ballembed)
  }

  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["BotManager"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
});

client.login(config.token);