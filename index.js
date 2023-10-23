const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Guild, GuildMember, Message,
	UserSelectMenuBuilder,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	REST,
	Routes
} = require('discord.js');
const { token, clientId, guildId } = require('./config.json');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);


for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
console.log(client.commands)
const commands = [];
// Grab all the command files from the commands directory you created earlier
const folderPath = path.join(__dirname, 'commands');
const commanFolders = fs.readdirSync(folderPath);

for (const folder of commanFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(folderPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
console.log(client.commands)

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
console.log(client.commands)

client.login(token);
client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {

	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isUserSelectMenu()) return;

	if (interaction.customId === 'user-menu') {
		const team = {};
		const teamName = interaction.user.username;
		console.log(teamName);

		await interaction.values.forEach(async value => {
			const ausgesuchteUser = await client.users.fetch(`${value}`);
			if (team[teamName]) {
				team[teamName].push(ausgesuchteUser.username);
			}			else {
				team[teamName] = [ausgesuchteUser.username];
			}
		});
		team[teamName].push(interaction.user.username);

		console.log(team);


		const modal = new ModalBuilder()
			.setCustomId('email')
			.setTitle('Emails of the participants are required');


		for (let i = 0; i < team[teamName].length; i++) {
			const customId = `partic${i + 1}`;
			const label = team[teamName][i];

			const participant = new TextInputBuilder()
				.setCustomId(customId)
				.setLabel(label)
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('example@example.com')
				.setRequired(true);

			const addParticipant = new ActionRowBuilder().addComponents(participant);
			modal.addComponents(addParticipant);


			console.log(addParticipant);
			console.log(participant);
			console.log(modal);
		}
		const teamname = new TextInputBuilder()
			.setCustomId('team-name')
			.setLabel('Choose your Teamname')
			.setStyle(TextInputStyle.Short)
			.setPlaceholder('Teamname')
			.setRequired(true)

		const namingTeam = new ActionRowBuilder().addComponents(teamname)
		modal.addComponents(namingTeam);


		console.log(namingTeam)
		console.log(teamname)
		console.log(modal)
		 fs.readFile('team.json', 'utf8', (err, data) => {
			if (err) {
	  console.error('Error reading the JSON file:', err);
	  return;
	}

    const jsonData = JSON.parse(data);

			// Füge die neuen Teamdaten zu jsonData hinzu
    jsonData[teamName] = team[teamName];

			// Konvertiere jsonData zurück in JSON-String
    const updatedData = JSON.stringify(jsonData, null, 2);

    // Schreibe die aktualisierten Daten zurück in die JSON-Datei
    fs.writeFile('team.json', updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to the JSON file:', err);
        return;
      }

      console.log('Daten wurden erfolgreich eingefügt oder aktualisiert.');
    });
  });

  // Zeige das Modal an
  await interaction.showModal(modal);}})
		client.on(Events.InteractionCreate, async interaction => {
				if (!interaction.isModalSubmit()) return;
				if (interaction.customId === 'email') {

					fs.readFile('team.json', 'utf8', (err, data) => {
							// Parse the JSON data into a JavaScript object
							let jsonData = JSON.parse(data);

							const teamname = interaction.fields.getTextInputValue('team-name')
							console.log(teamname)
							if (jsonData[teamname]) {
								jsonData[teamname + interaction.user.username] = jsonData[interaction.user.username];
								delete jsonData[interaction.user.username]

							} else {
								jsonData[teamname] = jsonData[interaction.user.username]
								delete jsonData[interaction.user.username]
							}




							// Convert the JavaScript object back to a JSON string
							const updatedData = JSON.stringify(jsonData, null, 2);

							// Write the updated data back to the JSON file
							fs.writeFile('team.json', updatedData, 'utf8', (err) => {
								if (err) {
									console.error('Error writing to the JSON file:', err);
									return;
								}

								console.log('Data has been inserted or updated successfully.');
							});


						}

						const Members = client.guilds.cache.get("GuildID").members.map(member => member.id);
					console.log(Members)
						await interaction.reply({ content: 'Your submission was received successfully!', ephemeral: true}));
				}
			}
		)
