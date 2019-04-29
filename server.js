const Eris = require("eris");
const roleAdvocate = "415878047351439360";
const roleEveryone = "412087578498695171";
const channelServerGuide = "420961453730824212";
const channelIntroduction = "416282628229038080";
const channelAdmin = "424917093683691540";
const channelResources = "428033045375877131";
const categoryServerWide = "412087578498695172";
const categoryWeeklyDiscussion = "518906310389923891";

const bot = new Eris.CommandClient(
  process.env.DISCORD_BOT_TOKEN,
  {},
  {
    description: "The bot for the AEC Collective",
    owner: "AEC Collective",
    prefix: "."
  }
);

bot.on("ready", () => {
  console.log("The bot is ready to roll!");
});

bot.on("messageCreate", msg => {
  if (msg.content.toLowerCase().includes("love") && !msg.author.bot) {
    msg.addReaction("\u2764");
    msg.addReaction("\uD83D\uDC96");
    msg.addReaction("\uD83D\uDC97");
    msg.addReaction("\uD83D\uDE0D");
    msg.addReaction("\uD83D\uDE3B");
  }
});

bot.on("guildMemberAdd", (guild, member) => {
  let announcementChannel = guild.channels.find(
    channel => channel.id === channelServerGuide
  );
  // put this in the #introduction channel
  let blackList = ["twitch.tv", "twitter.com", "twitter/", "discord.me"];
  if (
    !blackList.reduce(
      (acc, item) => acc || member.username.includes(item),
      false
    )
  ) {
    bot.createMessage(
      channelIntroduction,
      `Welcome ${member.mention}! Check ${
        announcementChannel.mention
      } to get up to speed. Then feel free to share your area of interest/expertise and join in the discussion! Also, visit our website at https://www.aeccollective.com for collected resources and information.`
    );
  }

  // put this in the admin channel for reference
  bot.createMessage(channelAdmin, `Welcome ${member.mention}!`);
  bot.createMessage(channelAdmin, {
    embed: {
      title: `${member.username} has joined.`, // Title of the embed
      description: `Please welcome them!`,
      author: {
        // Author property
        name: member.username,
        icon_url: member.avatarURL
      },
      color: 0x008000, // Color, either in hex (show), or a base-10 integer
      fields: [
        // Array of field objects
        {
          name: "username", // Field title
          value: `${member.username}`, // Field
          inline: true // Whether you want multiple fields in same line
        },
        {
          name: "discriminator",
          value: `${member.discriminator}`,
          inline: true
        }
      ]
    }
  });

  // ban the spammer
  if (member.username === "nicejobteam>") {
    member.ban(0, "Bot autoban from blacklist");
    bot.createMessage(
      channelAdmin,
      `We banned ${member.mention} because they were on the blacklist.`
    );
  }
});

bot.on("guildMemberRemove", (guild, member) => {
  bot.createMessage(
    channelAdmin,
    `${member.username || member.user} has just left.`
  );
});

const protectedRoles = ["Admin", "Advocate", "bot"];

bot.registerCommand(
  "iam",
  (msg, args) => {
    // Make an echo command
    if (args.length === 0) {
      // If the user just typed ".iam", say "Invalid input"
      return "Invalid input";
    }
    var text = args.join(" "); // Make a string of the text after the command label
    let returnText;
    msg.member.guild.roles.forEach(role => {
      if (
        role.name.toLowerCase() === text.toLowerCase() &&
        !protectedRoles.includes(text.toLowerCase())
      ) {
        returnText = role.name;
        msg.member
          .addRole(role.id, `Self assigned the ${role.name} role.`)
          .catch(error => {
            console.log(error);
            return "Hmm... something went wrong.";
          })
          .then(success => {
            return `You have been assigned the ${role.name} role.`;
          });
      }
    });
    return returnText
      ? `We assigned you the ${returnText} role.`
      : "Nothing assigned. Did you typo?";
  },
  {
    description: "Make the bot assign me a role.",
    fullDescription:
      "The bot will assign whatever role that it can. Only enter one role.",
    usage: "<role>"
  }
);

bot.registerCommand(
  "iamnot",
  (msg, args) => {
    // Make an echo command
    if (args.length === 0) {
      // If the user just typed ".iam", say "Invalid input"
      return "Invalid input";
    }
    var text = args.join(" "); // Make a string of the text after the command label
    let returnText;
    msg.member.guild.roles.forEach(role => {
      if (
        role.name.toLowerCase() === text.toLowerCase() &&
        !protectedRoles.includes(text.toLowerCase())
      ) {
        returnText = role.name;
        msg.member
          .removeRole(role.id, `Self removed the ${role.name} role.`)
          .catch(error => {
            console.log(error);
            return "Hmm... something went wrong.";
          })
          .then(success => {
            return `You have removed the ${role.name} role.`;
          });
      }
    });
    return returnText
      ? `We removed the ${returnText} role.`
      : "Nothing removed. Did you typo?";
  },
  {
    description: "Make the bot remove a role.",
    fullDescription:
      "The bot will remove whatever role that it can. Only enter one role.",
    usage: "<role>"
  }
);

bot.registerCommand(
  "addresource",
  (msg, args) => {
    let resourceCategory = args.shift();
    let resourceInformation = args.join(" ");

    // this one goes in the admin section
    bot
      .createMessage(channelResources, {
        embed: {
          title: `${resourceCategory} resource has been added.`, // Title of the embed
          description: `${resourceInformation}`,
          author: {
            // Author property
            name: msg.member.username,
            icon_url: msg.member.avatarURL
          },
          color: 0x008000, // Color, either in hex (show), or a base-10 integer
          fields: [
            // Array of field objects
            {
              name: "mention", // Field title
              value: `${msg.member.mention}`, // Field
              inline: true // Whether you want multiple fields in same line
            },
            {
              name: "nickname", // Field title
              value: `${msg.member.nick}`, // Field
              inline: false // Whether you want multiple fields in same line
            },
            {
              name: "username", // Field title
              value: `${msg.member.username}#${msg.member.discriminator}`, // Field
              inline: true // Whether you want multiple fields in same line
            },
            {
              name: "category",
              value: `${resourceCategory}`,
              inline: false
            }
          ]
        }
      })
      .catch(error => {
        console.log(error);
      });

    // this one goes in the channel
    bot
      .createMessage(msg.channel.id, {
        embed: {
          title: `${resourceCategory} resource has been added.`, // Title of the embed
          description: `${resourceInformation}`,
          author: {
            // Author property
            name: msg.member.username,
            icon_url: msg.member.avatarURL
          },
          color: 0x008000, // Color, either in hex (show), or a base-10 integer
          fields: [
            // Array of field objects
            {
              name: "category",
              value: `${resourceCategory}`,
              inline: true
            }
          ]
        }
      })
      .then(message => {
        message.pin();
      })
      .catch(error => {
        console.log(error);
      });

    return `Thanks ${msg.member.mention} for the submission!`;
  },
  {
    description: "Add a resource for the community to the list.",
    fullDescription:
      "The bot will add a resource to the list which will be added to our website resource page.",
    usage: "<category> <resource information>",
    argsRequired: true
  }
);

bot.registerCommand(
  "weekly",
  async (msg, args) => {
    // this is the Advocate role
    if (
      msg.member.roles.includes(roleAdvocate) &&
      msg.channel.name === "weekly-discussion"
    ) {
      const original = msg.channel
        .edit({ name: `wd-${args[0]}`, parentID: categoryWeeklyDiscussion })
        .catch(error => console.log(error))
        .then(async oldChannel => {
          // set it to read only
          return oldChannel
            .editPermission(roleEveryone, 1024, 2048, "role")
            .catch(error => console.log(error));
        });

      const newChannel = await original
        .catch(error => console.log(error))
        .then(oldChannel => {
          return bot
            .createChannel(
              msg.channel.guild.id,
              "weekly-discussion",
              0,
              "new weekly discussion channel",
              categoryServerWide
            )
            .catch(error => console.log(error));
        });

      // delay because if we act on it after promise return
      // we still don't have all of the methods that we can normally use
      await setTimeout(() => {
        bot
          .getChannel(newChannel.id)
          .editPosition(6)
          .catch(error => console.log(error));
      }, 10000);

      return;
    }

    return;
  },
  {
    description: "Set up the next weekly discussion.",
    fullDescription: "Set up the next weekly discussion.",
    usage: "",
    deleteCommand: true,
    argsRequired: true,
    requirements: { roleIDs: [roleAdvocate] }
  }
);

// this is a test block
bot.on("messageCreate", msg => {
  // When a message is created
  if (msg.content === "!embed") {
    // If the message content is "!embed"
    bot.createMessage(msg.channel.id, {
      embed: {
        title: "I'm an embed!", // Title of the embed
        description:
          "Here is some more info, with **awesome** formatting.\nPretty *neat*, huh?",
        author: {
          // Author property
          name: msg.author.username,
          icon_url: msg.author.avatarURL
        },
        color: 0x008000, // Color, either in hex (show), or a base-10 integer
        fields: [
          // Array of field objects
          {
            name: "Some extra info.", // Field title
            value: "Some extra value.", // Field
            inline: true // Whether you want multiple fields in same line
          },
          {
            name: "Some more extra info.",
            value: "Another extra value.",
            inline: true
          }
        ],
        footer: {
          // Footer text
          text: "Created with Eris."
        }
      }
    });
  } else if (msg.content === "!test") {
    let channelMention = msg.channel.guild.channels.find(
      channel => channel.id === `420961453730824212`
    );
    bot.createMessage(msg.channel.id, `Welcome to ${channelMention.mention}`);
  }
});

bot.connect();
