const PoweredUP = require("node-poweredup");
const ora = require("ora");
const poweredUP = new PoweredUP.PoweredUP();
const chalk = require("chalk");
const inquirer = require("inquirer");
const database = require("./mario-db.json")
const config = require("./config.json")
let searchy;

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    if (hub instanceof PoweredUP.Mario) {
        const mario = hub;
        spinner.text = `Connecting to ${hub.name}...`
        await hub.connect(); // Connect to the Hub
        clearInterval(searchy);
        spinner.succeed(`Connected to ${hub.name}!`);
        let marioData = {
            pants: 0,
            color: 0,
            barcode: 0,
            gesture: 0,
            scannedInARow: 0,
            goals: {
                nope: "nope"
            }
        }

        mario.on("pants", (_, { pants }) => {
            marioData.pants = pants;
            infoDisplay()
        });

        mario.on("gesture", (_, { gesture }) => {
            if(gesture == 0) return;
            marioData.gesture = gesture;
            infoDisplay()
        });

        mario.on("barcode", (_, { barcode, color }) => {
            if (color) {
                marioData.color = color
                infoDisplay()
            } 
            if (barcode) {
                if (barcode == marioData.barcode) {
                    marioData.scannedInARow += 1;
                } else {
                    marioData.scannedInARow = 1
                }
                marioData.barcode = barcode
                if (humanReadableBarcode(barcode).startsWith("Treasure Block")) {
                    let treasureBlock = humanReadableBarcode(barcode).substr(-1)
                    if(marioData.goals.treasureBlocks == undefined) marioData.goals.treasureBlocks = []
                    if(!marioData.goals.treasureBlocks.includes(treasureBlock)) marioData.goals.treasureBlocks.push(treasureBlock)
                } else if (humanReadableBarcode(barcode) == "Goal Flag") {
                    marioData.goals = {nope: "nope"};
                } else if (humanReadableBarcode(barcode) == "Yoshi" || humanReadableBarcode(barcode) == "Toad" || humanReadableBarcode(barcode) == "Toadette") {
                    if(marioData.goals.talkToFriends == undefined) marioData.goals.talkToFriends = []
                    if(!marioData.goals.talkToFriends.includes(humanReadableBarcode(barcode))) marioData.goals.talkToFriends.push(humanReadableBarcode(barcode))
                }
                infoDisplay()
            }
        });

        mario.on("disconnect", () => {
            if(!config.mario.reconnect) {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.redBright("Connection lost")}\nYour LEGO Mario disconnected from Vukky Powered Up.`);
                process.exit(0);
            } else {
                connect(true)
            }
        });

        function infoDisplay() {
            console.clear();
            console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("LEGO Mario Information Display")}`);
            console.log(`Pants: ${humanReadablePants(marioData.pants)}`)
            console.log(`Last scanned barcode: ${humanReadableBarcode(marioData.barcode)} ${humanReadableBarcode(marioData.barcode) !== "Sensor Off" && humanReadableBarcode(marioData.barcode) !== "None"  ? `- scanned ${marioData.scannedInARow} time(s) in a row` : ""}`)
            console.log(`Environment: ${humanReadableColor(marioData.color)}`)
            if(config.mario.showGoals) {
                console.log(`\n${chalk.greenBright("GOALS")}`)
                console.log("To reset goals, stand on the Goal Flag.\n")
                if(marioData.goals.treasureBlocks !== undefined) {
                    let treasures = marioData.goals.treasureBlocks
                    let allTreasuresUnlocked = treasures.includes("1") && treasures.includes("2") && treasures.includes("3") == true
                    console.log(`${allTreasuresUnlocked ? `✔️ Treasure Blocks` : `${chalk.blueBright(`Treasure Blocks`)}`}`)
                    if(!allTreasuresUnlocked) {
                        if(treasures.includes("1")) console.log("Treasure Block 1")
                        if(treasures.includes("2")) console.log("Treasure Block 2")
                        if(treasures.includes("3")) console.log("Treasure Block 3")
                    }
                }
                if(marioData.goals.talkToFriends !== undefined) {
                    let friends = marioData.goals.talkToFriends
                    let talkedToFriends = friends.includes("Yoshi") && friends.includes("Toad") && friends.includes("Toadette") == true
                    console.log(`${talkedToFriends ? `✔️ Talk to friends` : `${chalk.blueBright(`Talk to friends`)}`}`)
                    if(!talkedToFriends) {
                        if(friends.includes("Yoshi")) console.log("Yoshi")
                        if(friends.includes("Toad")) console.log("Toad")
                        if(friends.includes("Toadette")) console.log("Toadette")
                    }
                }
                if(Object.keys(marioData.goals).length == 1) {
                    console.log("You haven't unlocked any goals yet.")
                }
            }
            if(config.mario.showExperimental) {
                console.log(`\n${chalk.yellow("EXPERIMENTAL SECTION")}`)
                console.log(`Last gesture: ${humanReadableGesture(marioData.gesture)}`)
                console.log(`Name: ${hub.name}`)
            }
        }

        function humanReadableGesture(gesture) {
            if(database.gestures[gesture]) {
                return database.gestures[gesture]
            } else {
                return `Unknown (${gesture})`
            }
        }

        function humanReadableColor(color) {
            if(database.colors[color]) {
                return database.colors[color]
            } else {
                return `Unknown (${color})`
            }
        }

        function humanReadablePants(pants) {
            if(database.pants[pants]) {
                return database.pants[pants]
            } else {
                return `Unknown (${pants})`
            }
        }

        function humanReadableBarcode(barcode) {
            if(database.blocks[barcode]) {
                return database.blocks[barcode]
            } else {
                return `Unknown (${barcode})`
            }
        }
    }
});

function connect(disconnect) {
    console.clear();
    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("LEGO Mario")}`);
    if(disconnect == true) {
        console.log("Your LEGO Mario disconnected from Vukky Powered Up.\nWe'll try reconnecting, although you might need to restart the script or make Mario connect again.\nYour data has been lost - sorry!\n");
    }
    searchy = setInterval(() => {
        spinner.stop();
        poweredUP.scan(); // Start scanning for Hubs
        spinner = ora('Looking for LEGO Mario...').start();
        spinner.spinner = config.spinner
    }, 5000);
    poweredUP.scan(); // Start scanning for Hubs
    spinner = ora('Looking for LEGO Mario...').start();
    spinner.spinner = config.spinner
}

connect()