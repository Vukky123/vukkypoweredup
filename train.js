const PoweredUP = require("node-poweredup");
const ora = require("ora");
const poweredUP = new PoweredUP.PoweredUP();
const chalk = require("chalk");
const inquirer = require("inquirer");
const accelerationSleep = 5
let scanning;
let currentSpeed = 0

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    if (hub instanceof PoweredUP.Hub) {
        scanning.succeed(`Discovered ${hub.name}!`);
        const connecting = ora(`Connecting to ${hub.name}...`).start();
        await hub.connect(); // Connect to the Hub
        connecting.succeed(`Connected to ${hub.name}!`);
        hub.on("disconnect", () => {
            connect()
        })
        const motorAwait = ora(`Looking for a motor connected to port A...`).start();
        const motorA = await hub.waitForDeviceAtPort("A"); // Make sure a motor is plugged into port A
        motorAwait.succeed(`Found a motor connected to port A!`);
        function speedie() {
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'speed',
                        message: `What should the speed be set to?`,
                        validate: function (value) {
                            if (value >= -100 && value <= 100 && value != NaN && value != "") {
                                return true;
                            }
                            return 'Please enter a valid speed. Minimum -100, maximum 100. Use - for reverse.';
                        },
                    }
                ])
                .then(async answers => {
                    console.clear();
                    const pleaseWait = ora('Please wait...').start()
                    while (answers.speed != currentSpeed) {
                        if (answers.speed < currentSpeed) {
                            currentSpeed--
                            await motorA.setPower(currentSpeed)
                            await hub.sleep(accelerationSleep)
                        } else {
                            currentSpeed++
                            await motorA.setPower(currentSpeed)
                            await hub.sleep(accelerationSleep)
                        }
                    }
                    currentSpeed = answers.speed
                    pleaseWait.succeed('')
                    console.clear();
                    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Train Control")}\n${hub.name} is running at ${answers.speed}.`)
                    if(answers.speed >= 95) console.log(`${chalk.yellow("WARNING: 95 and above have been found to be very fast. Expect a crash.")}`)
                    speedie();
                })
        }
        speedie();
    }
});

function connect() {
    console.clear();
    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Train")}`);
    poweredUP.scan(); // Start scanning for Hubs
    scanning = ora('Scanning for hubs...').start();
}
connect()