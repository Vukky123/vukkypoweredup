const PoweredUP = require("node-poweredup");
const ora = require("ora");
const poweredUP = new PoweredUP.PoweredUP();
const chalk = require("chalk");
const inquirer = require("inquirer");
const accelerationSleep = 5
const disallowedSpeedMin = -30
const disallowedSpeedMax = 30
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
                    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Train Control")}`)
                    const pleaseWait = ora('Accelerating to new speed...').start()
                    while (answers.speed != currentSpeed) {
                        if (answers.speed < currentSpeed) {
                            currentSpeed--
                            await setPower(motorA, currentSpeed)
                            await hub.sleep(accelerationSleep)
                        } else {
                            currentSpeed++
                            await setPower(motorA, currentSpeed)
                            await hub.sleep(accelerationSleep)
                        }
                    }
                    currentSpeed = answers.speed
                    pleaseWait.succeed('')
                    console.clear();
                    if(answers.speed > disallowedSpeedMin && answers.speed < disallowedSpeedMax == true) currentSpeed = 0
                    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Train Control")}\n${hub.name} is running at ${currentSpeed}.`)
                    if(answers.speed >= 95) console.log(`${chalk.yellow("WARNING: 95 and above have been found to be very fast. Expect a crash.")}`)
                    if(answers.speed > disallowedSpeedMin && answers.speed < disallowedSpeedMax == true && answers.speed != 0) console.log(`${chalk.yellow("WARNING: The speed you have requested may cause damages to your motor.\nFor your protection, the speed has been set to 0.")}`)
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

async function setPower(device, speed) {
    if(speed > disallowedSpeedMin && speed < disallowedSpeedMax == true) {
        await device.setPower(0)
    } else {
        await device.setPower(speed)
    }
}