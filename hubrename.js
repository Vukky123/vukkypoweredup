const PoweredUP = require("node-poweredup");
const ora = require("ora");
const poweredUP = new PoweredUP.PoweredUP();
const chalk = require("chalk");
const inquirer = require("inquirer")

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    scanning.succeed(`Discovered ${hub.name}!`);
    const connecting = ora(`Connecting to ${hub.name}...`).start();
    await hub.connect(); // Connect to the Hub
    connecting.succeed(`Connected to ${hub.name}!`);
    hub.on("disconnect", () => {
        console.clear();
        console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.redBright("Connection lost")}\nYour hub (${hub.name}) disconnected from Vukky Powered Up.`);
        process.exit(0);
    })
    let oldName = hub.name;
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'newName',
                message: `What should ${oldName}'s new name be?`,
                validate: function (value) {
                    if (value.match(/^[\x00-\x7F]*$/) && value.length < 14 == true) {
                      return true;
                    }
                    return 'Please enter a valid name. 14 characters or less, ASCII only.';
                },
            }
        ])
        .then(async answers => {
            await hub.setName(answers.newName)
            console.clear();
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Rename complete!")}\n${oldName} should now be known as ${answers.newName}.`)
            process.exit(0);
        })
});

console.clear();
console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Hub Renamer")}`);
poweredUP.scan(); // Start scanning for Hubs
const scanning = ora('Scanning for hubs...').start();