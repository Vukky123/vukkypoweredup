const PoweredUP = require("node-poweredup");
const ora = require("ora");
const poweredUP = new PoweredUP.PoweredUP();
const chalk = require("chalk");
let hubinfodisplay;
let ready = false;

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    if (hub instanceof PoweredUP.Hub) {
        scanning.succeed(`Discovered ${hub.name}!`);
        const connecting = ora(`Connecting to ${hub.name}...`).start();
        await hub.connect(); // Connect to the Hub
        connecting.succeed(`Connected to ${hub.name}!`);
        hub.on("disconnect", () => {
            if(ready) clearInterval(hubinfodisplay);
            console.clear();
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.redBright("Connection lost")}\nYour hub (${hub.name}) disconnected from Vukky Powered Up.`);
            process.exit(0);
        })
        hubinfodisplay = setInterval(() => {
            if(!ready) return;
            console.clear();
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Hub Information Display")}`);
            console.log(`Hub battery level: ${hub.batteryLevel}%`);
            if(hub.batteryLevel == 0) console.log(`${chalk.yellow("\nWARNING: Something's not right here.")}\nThere might be an issue with your batteries.`)
        }, 20000);
        const motorAwait = ora(`Looking for a motor connected to port A...`).start();
        const motorA = await hub.waitForDeviceAtPort("A"); // Make sure a motor is plugged into port A
        motorAwait.succeed(`Found a motor connected to port A!`);
        ready = true;
        console.log("Running motor A at maximum speed.");
        motorA.setPower(100);
        console.log("Hub information will appear soon.");
    }
});

console.clear();
console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Train")}`);
poweredUP.scan(); // Start scanning for Hubs
const scanning = ora('Scanning for hubs...').start();