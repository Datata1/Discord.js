const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Guild, GuildMember, Message,
	UserSelectMenuBuilder,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const { token } = require('./config.json');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
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

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	const { cooldowns } = client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
		}
	} else if (interaction.isButton()) {
			// respond to the button
		} else if (interaction.isStringSelectMenu()) {
			// respond to the select menu
		}


	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isUserSelectMenu()) return;

	if (interaction.customId === 'user-menu') {
		const team = {};
		const teamName = interaction.user.username
		console.log(teamName)

		await interaction.values.forEach(async value => {
			const ausgesuchteUser = await client.users.fetch(`${value}`);
			if (team[teamName]) {
				team[teamName].push(ausgesuchteUser.username);
			} else {
				team[teamName] = [ausgesuchteUser.username];
			}
		});
		team[teamName].push(interaction.user.username)

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

			const addParticipant = new ActionRowBuilder().addComponents(participant)
			modal.addComponents(addParticipant);


			console.log(addParticipant)
			console.log(participant)
			console.log(modal)
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
  await interaction.showModal(modal);}}


)


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

							// Merge the new data with the existing data
							Object.assign(data, jsonData[teamname]);

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


						},
						await interaction.reply({content: 'Your submission was received successfully!'}))
				}
			}
		)
