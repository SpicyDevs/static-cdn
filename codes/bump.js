import { Embed, ErrorEmbed } from "../../../structures/Utils/Embeds.mjs";

import { checkPreMusicCommand } from "../../../structures/Utils/MusicUtils.mjs";

export default {

    name: "bump",

    description: "Bumps a specific track to the top of the queue.",

    args: {

        min: 1,

        max: 1,

        names: ["<song index>"],

    },

    slashCommandKey: "/queue bump",

    async execute(client, message, args) {

        const player = client.musicManager.players.get(message.guildId);

        if (!checkPreMusicCommand(message, player, this.name, {

            isInVC: true,

            existing: true,

            dj: true,

            alldaymusic: true,

            paused: false,

            checkPerms: false,

            current: true,

            sameVc: true,

            tracksInQueue: true,

        })) return;

        let songIndex = args[0];

        if (songIndex === "last") {

            songIndex = player.queue.size;

        } else {

            songIndex = Number(songIndex);

        }

        if (!songIndex || isNaN(songIndex) || songIndex > player.queue.size) {

            return await message.reply({

                ephemeral: true,

                embeds: [

                    new ErrorEmbed(message)

                        .addField("commands.player.move.songNotExist.title", "commands.player.move.songNotExist.text")

                        .translate(message.guildId, { jumpTo: songIndex, queueSize: player.queue.size })

                ]

            });

        }

        const trackToBump = player.queue.splice(songIndex - 1, 1)[0];

        player.queue.unshift(trackToBump);

        return await message.reply({

            ephemeral: false,

            embeds: [

                new Embed(message).setDescription(client.translate(message.guildId, "commands.player.bump.bumped", { songTitle: trackToBump.title }))

            ]

        });

    },

};

