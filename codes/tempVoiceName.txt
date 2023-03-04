import { checkPreMusicCommand } from "../../../structures/Utils/MusicUtils.mjs";

import { parseChannelMention } from "../../../structures/Utils/StringUtils.mjs";

/** @type {import("../../../structures/Types/Command.mjs").PrefixCommand}*/

export default {

    name: "name",

    slashCommandKey: "/temp voice name",

    description: "Changes the name of the temporary voice channel.",

    options: [{

        name: "name",

        description: "The new name for the channel.",

        type: "STRING",

        required: true,

    }],

    async execute(client, message, args) {

        if (!checkPreMusicCommand(message, undefined, "voice", { isInVC: true })) return;

        const vc = message.member.voice.channel;

        const tempVoice = await client.remoteCache.joinToCreates.get(vc.guildId, vc.id);

        if (!tempVoice) {

            return await message.reply({

                ephemeral: true,

                embeds: [

                    new ErrorEmbed(message).addField(client.translate(message.guildId, "commands.temporary.voice.errors.notVC.title"), client.translate(message.guildId, "commands.temporary.voice.errors.notVC.text", { channelMention: parseChannelMention(vc.id) }))

                ]

            });

        }

        try {

            await vc.setName(args[0]);

            return await message.reply({

                ephemeral: true,

                content: `Channel name updated to ${args[0]}.`

            });

        } catch (error) {

            return await message.reply({

                ephemeral: true,

                embeds: [

                    new ErrorEmbed(message).addField(client.translate(message.guildId, "general.errors.title"), client.translate(message.guildId, "commands.temporary.voice.errors.setName", { error: error.message }))

                ]

            });

        }

    }

}

