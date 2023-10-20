const { UserSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder,
	User
} = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),

	category: 'ping',
	async execute(interaction) {
		const UserSelectMenu = new UserSelectMenuBuilder()
			.setCustomId('user-menu')
			.setMaxValues(2) // One user maximum
			.setMinValues(0) // One user minimum
			.setPlaceholder('(optional) Select up to three User');


		const row = new ActionRowBuilder()
			.addComponents(UserSelectMenu);

		await interaction.reply({
			content: `jsahfkljsfasf`,
			components: [row],
		})
	},
};