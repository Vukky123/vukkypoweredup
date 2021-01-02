const PoweredUP = require("node-poweredup");
const config = require("./config.json");
const ora = require("ora");
const poweredUP = new PoweredUP.PoweredUP();
const accelerationSleep = 5
const disallowedSpeedMin = -30
const disallowedSpeedMax = 30
let scanning;
let currentSpeed = 0

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    if (hub instanceof PoweredUP.Hub) {
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
        spinner.text = `Looking for a motor connected to port A...`
        const motor = await hub.waitForDeviceAtPort(config.train.motor); // Make sure a motor is plugged into port A
        spinner.succeed(`Ready!`);
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
                    await speedieDone(answers.speed, 'Accelerating to new speed...')
                })
        }
        
        async function speedieDone(speed, accelerateText) {
            console.clear();
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Train Control")}`)
            spinner = ora(accelerateText).start();
            spinner.spinner = config.spinner
            while (speed != currentSpeed) {
                if (speed < currentSpeed) {
                    currentSpeed--
                    await setPower(motor, currentSpeed)
                    await hub.sleep(accelerationSleep)
                } else {
                    currentSpeed++
                    await setPower(motor, currentSpeed)
                    await hub.sleep(accelerationSleep)
                }
            }
            currentSpeed = speed
            spinner.succeed('')
            console.clear();
            if(speed > disallowedSpeedMin && speed < disallowedSpeedMax == true) currentSpeed = 0
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Train Control")}\n${hub.name} is running at ${currentSpeed}.`)
            if(speed >= 95 || speed <= -95) console.log(`${chalk.yellow("WARNING: 95 and above have been found to be very fast. Expect a crash.")}`)
            if(speed > disallowedSpeedMin && speed < disallowedSpeedMax == true && speed != 0) console.log(`${chalk.yellow("WARNING: The speed you have requested may cause damages to your motor.\nFor your protection, the speed has been set to 0.")}`)
            speedie();
        }
        if(config.train.defaultSpeed == null) {
            speedie();
        } else {
            speedieDone(config.train.defaultSpeed, 'Accelerating to default speed...')
        }
    }
});

function connect() {
    console.clear();
    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Train")}`);
    poweredUP.scan(); // Start scanning for Hubs
    console.log(chalk.yellow(`Default speed is on! Yours is ${config.train.defaultSpeed}. Change it in the settings.`))
    spinner = ora('Looking for hubs...').start();
    spinner.spinner = config.spinner
}
connect()

async function setPower(motor, speed) {
    if(speed > disallowedSpeedMin && speed < disallowedSpeedMax == true) {
        await motor.setPower(0)
    } else {
        await motor.setPower(speed)
    }
}