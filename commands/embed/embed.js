const { ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('create the pinned message for the hackathon channel'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setFooter({ text: 'By using the /signup command you accept the Terms and Conditions', iconURL: interaction.guild.icon});

		const TaC = new ButtonBuilder()
			.setCustomId('Terms and Conditions')
			.setLabel('Terms and Conditions')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(TaC);

		await interaction.reply({ embeds: [exampleEmbed], components: [row] });
	},
};