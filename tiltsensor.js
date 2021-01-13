const PoweredUP = require("node-poweredup");
const config = require("./config.json");
const ora = require("ora");
const chalk = require("chalk");
const inquirer = require("inquirer");
const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    if (hub instanceof PoweredUP.MoveHub) {
        spinner.text = `Connecting to ${hub.name}...`
        await hub.connect(); // Connect to the Hub
        hub.on("disconnect", () => {
            if(!config.train.reconnect) {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.redBright("Connection lost")}\n${hub.name} disconnected from Vukky Powered Up.`);
                process.exit(0);
            } else {
                connect()
            }
        })
        spinner.succeed(`Ready! Waiting for tilt...`);
        hub.on("tilt", (device, { x, y }) => {
            display(x, y)
        });
        
        function display(x, y) {
            console.clear();
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Tilt Sensor Test")}\nX: ${x}, Y: ${y}`)
        }
    }
});

function connect() {
    console.clear();
    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Tilt Sensor Test")}`);
    poweredUP.scan(); // Start scanning for Hubs
    spinner = ora('Looking for hubs...').start();
    spinner.spinner = config.spinner
}
connect()