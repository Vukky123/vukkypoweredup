const PoweredUP = require("node-poweredup");
const ora = require("ora");
const poweredUP = new PoweredUP.PoweredUP();
const chalk = require("chalk");
const inquirer = require("inquirer")

let color = 1;
setInterval(() => {
    const hubs = poweredUP.getHubs(); // Get an array of all connected hubs
    hubs.forEach(async (hub) => {
        const led = await hub.waitForDeviceByType(PoweredUP.Consts.DeviceType.HUB_LED);
        led.setColor(color); // Set the color
    })
    color++;
    if (color > 10) {
        color = 1;
    }
}, 2000);

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    scanning.succeed(`Discovered ${hub.name}!`);
    const connecting = ora(`Connecting to ${hub.name}...`).start();
    await hub.connect(); // Connect to the Hub
    connecting.succeed(`Connected to ${hub.name}!`);
});

console.clear();
console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Color Viewer")}`);
poweredUP.scan(); // Start scanning for Hubs
const scanning = ora('Scanning for hubs...').start();