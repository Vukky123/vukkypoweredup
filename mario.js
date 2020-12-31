const PoweredUP = require("node-poweredup");
const ora = require("ora");
const poweredUP = new PoweredUP.PoweredUP();
const chalk = require("chalk");

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    if (hub instanceof PoweredUP.Mario) {
        scanning.succeed(`Found Mario!`);
        const mario = hub;
        const connecting = ora(`Connecting to Mario...`).start();
        await hub.connect(); // Connect to the Hub
        connecting.succeed(`Connected to Mario!`);
        let marioData = {
            pants: 0,
            color: 0,
            barcode: 0,
            scannedInARow: 0,
            goals: {
                treasureBlocks: null
            }
        }

        mario.on("pants", (_, { pants }) => {
            marioData.pants = pants;
            infoDisplay()
        });

        mario.on("barcode", (_, { barcode, color }) => {
            if (color) {
                marioData.color = color
            } else if (barcode) {
                if (barcode == marioData.barcode) {
                    marioData.scannedInARow += 1;
                } else {
                    marioData.scannedInARow = 1
                }
                marioData.barcode = barcode
                if (humanReadableBarcode(barcode).startsWith("Treasure Block")) {
                    let treasureBlock = humanReadableBarcode(barcode).substr(-1)
                    if(marioData.goals.treasureBlocks == null) marioData.goals.treasureBlocks = []
                    if(!marioData.goals.treasureBlocks.includes(treasureBlock)) marioData.goals.treasureBlocks.push(treasureBlock)
                }
                infoDisplay()
            }
        });

        mario.on("disconnect", () => {
            console.clear();
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.redBright("Connection lost")}\nYour Mario disconnected from Vukky Powered Up.`);
            process.exit(0);
        });

        function infoDisplay() {
            console.clear();
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Mario Information Display")}`);
            console.log(`Pants: ${humanReadablePants(marioData.pants)}`)
            console.log(`Last scanned barcode: ${humanReadableBarcode(marioData.barcode)} ${humanReadableBarcode(marioData.barcode) !== "Sensor Off" && humanReadableBarcode(marioData.barcode) !== "None"  ? `- scanned ${marioData.scannedInARow} time(s) in a row` : ""}`)
            if(marioData.goals.treasureBlocks !== null) {
                let treasures = marioData.goals.treasureBlocks
                console.log(`\n${treasures.includes("1") && treasures.includes("2") && treasures.includes("3") ? `${chalk.blueBright(`Treasure Blocks`)} - ${chalk.green(`All Treasure Blocks found!`)}` : `${chalk.blueBright(`Treasure Blocks`)}`}`)
                if(treasures.includes("1")) console.log("Treasure Block 1")
                if(treasures.includes("2")) console.log("Treasure Block 2")
                if(treasures.includes("3")) console.log("Treasure Block 3")
            }
        }

        function humanReadablePants(pants) {
            switch(pants) {
                case 0:
                    return "None"
                case 12:
                    return "Propeller"
                case 17:
                    return "Cat"
                case 18:
                    return "Fire"
                case 32:
                    return "Standard (Bluetooth Prompt)"
                case 33:
                    return "Standard"
                default:
                    return `Unknown (${pants})`
            }
        }

        function humanReadableBarcode(barcode) {
            switch(barcode) {
                case 0:
                    return "None"
                case 2:
                    return "(Para)goomba/Fuzzy"
                case 3:
                    return "Shy Guy"
                case 14:
                    return "Bob-Omb"
                case 29:
                    return "Bowser"
                case 41:
                    return "Question Mark Block"
                case 43:
                    return "Treasure Block 2"
                case 46:
                    return "Cloud"
                case 48:
                    return "Spiny"
                case 60:
                    return "Toad"
                case 93:
                    return "Yoshi"
                case 95:
                    return "P-Block"
                case 99:
                    return "Super Mushroom"
                case 123:
                    return "Super Star Block"
                case 128:
                    return "Treasure Block 3"
                case 129:
                    return "Peepa"
                case 137:
                    return "Blooper/Eep Cheep"
                case 153:
                    return "Bowser Jr."
                case 184:
                    return "Start Pipe"
                case 183:
                    return "Finish Flag"
                case 65535:
                    return "Sensor Off"
                default:
                    return `Unknown (${barcode})`
            }
        }
    }
});

console.clear();
console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Mario")}`);
poweredUP.scan(); // Start scanning for Hubs
const scanning = ora('Looking for Mario...').start();