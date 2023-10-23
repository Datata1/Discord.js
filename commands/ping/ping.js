const { UserSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder,
	User
} = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('signup')
		.setDescription('Starts the process of registration.'),

	category: 'ping',
	async execute(interaction) {
		const UserSelectMenu = new UserSelectMenuBuilder()
			.setCustomId('user-menu')
			.setMaxValues(2) // One user maximum
			.setMinValues(0) // One user minimum
			.setPlaceholder('');


		const row = new ActionRowBuilder()
			.addComponents(UserSelectMenu);

		await interaction.reply({
			content: `Select yourself and up to two Teammembers:`,
			components: [row],
			ephemeral: true
		})
	},
};