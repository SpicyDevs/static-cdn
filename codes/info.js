const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
  let verifLevels = {
    "0": "None",
    "1": "Low",
    "2": "Medium",
    "3": "High",
    "4": "Highest"
  }

  let region = {
    "brazil": `:flag_br: `,
    "eu-central": `:flag_eu: `,
    "singapore": `:flag_sg: `,
    "us-central": `:flag_us: `,
    "sydney": `:flag_au: `,
    "us-east": `:flag_us: `,
    "us-south": `:flag_us: `,
    "us-west": `:flag_us: `,
    "eu-west": `:flag_eu: `,
    "vip-us-east": `:flag_us: `,
    "europe": `:flag_gb:`,
    "amsterdam": `:flag_nl:`,
    "hongkong": `:flag_hk: `,
    "russia": `:flag_ru: `,
    "southafrica": `:flag_za: `
  }

  let tier = {
    "0": "None",
    "1": "TIER 1",
    "2": "TIER 2",
    "3": "TIER 3"
  }

  const members = await interaction.guild.members.fetch();

  client.embed({
    title: `Server Information`,
    desc: `Information about: **${interaction.guild.name}**`,
    thumbnail: interaction.guild.iconURL({ dynamic: true, size: 1024 }),
    image: interaction.guild.bannerURL({ size: 1024 }),
    fields: [
      {
        name: "Server Name:",
        value: `${interaction.guild.name}`,
        inline: true,
      },
      {
        name: "Server ID:",
        value: `\`${interaction.guild.id}\``,
        inline: true,
      },
      {
        name: "Owner:",
        value: `<@!${interaction.guild.ownerId}>`,
        inline: true
      },
      {
        name: "Verify Level:",
        value: `${verifLevels[interaction.guild.verificationLevel]}`,
        inline: true
      },
      {
        name: "Boost Tier:",
        value: `${tier[interaction.guild.premiumTier]}`,
        inline: true
      },
      {
        name: "Boost Count:",
        value: `\`${interaction.guild.premiumSubscriptionCount || '0'}\` Boosts`,
        inline: true
      },
      {
        name: "Created on:",
        value: `<t:${Math.round(interaction.guild.createdTimestamp / 1000)}>`,
        inline: true
      },
      {
        name: "Members:",
        value: `\`${interaction.guild.memberCount}\` Members`,
        inline: true
      },
      {
        name: "Bots:",
        value: `\`${members.filter(member => member.user.bot).size}\` Bots`,
        inline: true
      },
      {
        name: "Text Channels:",
        value: `\`${interaction.guild.channels.cache.filter(channel => channel.type === Discord.ChannelType.GuildText).size}\` Channels`,
        inline: true
      },
      {
        name: "Voice Channels:",
        value: `\`${interaction.guild.channels.cache.filter(channel => channel.type ===  Discord.ChannelType.GuildVoice).size}\` Channels`,
        inline: true
      },
      {
        name: "Stage Channels:",
        value: `\`${interaction.guild.channels.cache.filter(channel => channel.type ===  Discord.ChannelType.GuildStageVoice).size}\` Channels`,
        inline: true
      },
      {
        name: "News Channels:",
        value: `\`${interaction.guild.channels.cache.filter(channel => channel.type ===  Discord.ChannelType.GuildAnnouncement).size}\` Channels`,
        inline: true
      },
      {
        name: "Public Threads:",
        value: `\`${interaction.guild.channels.cache.filter(channel => channel.type === 'GUILD_PUBLIC_THREAD').size}\` Threads`,
        inline: true
      },
      {
        name: "Private Threads:",
        value: `\`${interaction.guild.channels.cache.filter(channel => channel.type === 'GUILD_PRIVATE_THREAD').size}\` Threads`,
        inline: true
      },
      {
        name: "Roles:",
        value: `\`${interaction.guild.roles.cache.size}\` Roles`,
        inline: true
      },
      {
        name: "Emoji count:",
        value: `\`${interaction.guild.emojis.cache.size}\` Emoji's`,
        inline: true
      },
      {
        name: "Sticker count:",
        value: `\`${interaction.guild.stickers.cache.size}\` Stickers`,
        inline: true
      }
    ],
    type: 'editreply'
  }, interaction)
}

   
