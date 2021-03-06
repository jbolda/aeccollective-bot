const Eris = require("eris");
const parse = require("date-fns/parse");
const formatDistanceToNow = require("date-fns/formatDistanceToNow");

const roleAdvocate = "415878047351439360";
const roleEveryone = "412087578498695171";
const channelServerGuide = "420961453730824212";
const channelIntroduction = "416282628229038080";
const channelAdmin = "424917093683691540";
const channelBot = "422739822013317130";
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
      } to get up to speed. Please note that you need to add a role to chat in other channels. We did this to cut down on spam. Then feel free to share your area of interest/expertise and join in the discussion! Also, visit our website at https://www.aeccollective.com for collected resources and information.`
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

bot.on("messageCreate", msg => {
  if (msg.channel.id === channelIntroduction && msg.member.roles.length === 0) {
    const httpString = `/(http:\/\/www.|https:\/\/www.|http:\/\/|https:\/\/)/g`;

    if (msg.embeds.length > 0) {
      bot.createMessage(
        channelBot,
        `Content in Introduction from ${msg.member.mention} contained links: ${
          msg.content
        }`
      );
      return msg.delete(`Content contained embeds: ${msg.content}`);
    } else if (!!msg.content.match(httpString)) {
      bot.createMessage(
        channelBot,
        `Content in Introduction from ${msg.member.mention} contained links: ${
          msg.content
        }`
      );
      return msg.delete(`Content contained link: ${msg.content}`);
    }
  }
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
  "quote",
  (msg, args) => {
    // Make an echo command
    if (args.length === 0) {
      // If the user just typed ".quote", say:
      return "Include a link to a message.";
    } else if (args.length > 1) {
      // If the user just typed ".quote", a link, and more stuff, say:
      return "Include a link to a message.";
    }

    const discordLink = args.join(" "); // Make a string of the text after the command label
    const discordLinkParts = discordLink.split("/");
    const channelID = discordLinkParts[discordLinkParts.length - 2]; // get second to last item, should be channelID
    const messageID = discordLinkParts[discordLinkParts.length - 1]; // get last item, should be ID

    return bot
      .getMessage(channelID, messageID)
      .then(message => {
        return `${message.author.mention} said ${formatDistanceToNow(
          parse(message.timestamp, "T", new Date())
        )} ago in ${message.channel.mention}:\n${discordLink}\n>>> ${
          message.content
        }`;
      })
      .catch(
        error =>
          `We couldn't find the message. Is it an invalid link?\n>>> ${error}`
      );
  },
  {
    description: "Ask the bot to pull a quote based on a message link.",
    fullDescription:
      "Ask the bot to pull a quote based on a message link. You need developer mode enabled to copy the link. On mobile, press and hold, click share, and then copy to clipboard. On desktop, right click and copy the link.",
    usage: "<message link>",
    argsRequired: true,
    deleteCommand: true
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
    requirements: { roleIDs: [roleAdvocate] },
    hidden: true
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
