const chalk = require("chalk");
const inquirer = require("inquirer");
const ora = require("ora");
const fs = require("fs");
const config = require("./config.json");

menu()

function menu() {
    console.clear();
    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
    console.log(chalk.yellowBright("Don't forget to save your changes!"))
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'settings',
                message: 'What do you want to do?',
                choices: [
                    'Change Train settings',
                    'Change LEGO Mario settings',
                    'Change spinner settings',
                    new inquirer.Separator(),
                    'Save changes and exit',
                    'Discard changes and exit'
                ],
            },
        ])
        .then(async answers => {
            if(answers.settings == 'Change LEGO Mario settings') marioSettings()
            if(answers.settings == 'Change Train settings') trainSettings()
            if(answers.settings == 'Change spinner settings') spinnerSettings()
            if(answers.settings == 'Save changes and exit') {
                const spinner = ora('Saving changes...').start();
                spinner.spinner = config.spinner
                fs.writeFile("config.json", JSON.stringify(config, null, 4), function (err) {
                    if (err) {
                        spinner.fail("Your changes couldn't be saved.");
                        console.log(err);
                        process.exit(1);
                    } else {
                        console.clear()
                        spinner.succeed("Your changes have been saved.");
                        process.exit(0);
                    }
                });
            }
            if(answers.settings == 'Discard changes and exit') {
                console.clear()
                console.log("Your changes have been discarded.")
                process.exit(0)
            }
        });
}

function spinnerSettings() {
    console.clear();
    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'settings',
                message: 'What do you want to do?',
                choices: [
                    'Unicode',
                    new inquirer.Separator(),
                    'Go back'
                ],
            },
        ])
        .then(async answers => {
            if(answers.settings == 'Go back') menu()
            if(answers.settings == 'Unicode') {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            name: 'unicode',
                            message: 'Should Unicode characters be used in the spinner?'
                        },
                    ])
                    .then((answers) => {
                        if(answers.unicode == true) {
                            config.spinner = {
                                "interval": 125,
                                "frames": [
                                    "∙∙∙",
                                    "●∙∙",
                                    "∙●∙",
                                    "∙∙●",
                                    "∙∙∙"
                                ]
                            }
                        } else {
                            config.spinner = {
                                "interval": 130,
                                "frames": [
                                    "-",
                                    "\\",
                                    "|",
                                    "/"
                                ]
                            }
                        }
                        spinnerSettings()
                    });
            }
        });
}

function trainSettings() {
    console.clear();
    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'settings',
                message: 'What setting would you like to change?',
                choices: [
                    'Reconnecting',
                    'Default speed',
                    'Motor',
                    new inquirer.Separator(),
                    'Go back'
                ],
            },
        ])
        .then((answers) => {
            if(answers.settings == 'Go back') menu()
            if(answers.settings == 'Reconnecting') {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            name: 'settings',
                            message: 'Should reconnecting be enabled?'
                        },
                    ])
                    .then((answers) => {
                        config.train.reconnect = answers.settings
                        trainSettings()
                    });
            }
            if(answers.settings == 'Default speed') {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            name: 'defaultSpeedEnabled',
                            message: 'Should default speeds be enabled?'
                        },
                        {
                            type: 'input',
                            name: 'defaultSpeed',
                            message: 'What should the default speed be set to?',
                            when: function (answers) {
                                return answers.defaultSpeedEnabled !== false;
                            },
                            validate: function (value) {
                                var valid = !isNaN(parseFloat(value));
                                return valid || 'Please enter a number';
                            },
                        },
                    ])
                    .then((answers) => {
                        if(answers.defaultSpeedEnabled == false) {
                            config.train.defaultSpeed = null
                        } else {
                            config.train.defaultSpeed = answers.defaultSpeed
                        }
                        trainSettings()
                    });
            }
            if(answers.settings == 'Motor') {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
                inquirer
                    .prompt([
                        {
                            type: 'input',
                            name: 'settings',
                            message: 'What port is used for the motor?'
                        },
                    ])
                    .then((answers) => {
                        config.train.motor = answers.settings
                        trainSettings()
                    });
            }
        });
}

function marioSettings() {
    console.clear();
    console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'settings',
                message: 'What setting would you like to change?',
                choices: [
                    'Reconnecting',
                    'Experimental section',
                    'Goals section',
                    new inquirer.Separator(),
                    'Go back'
                ],
            },
        ])
        .then((answers) => {
            if(answers.settings == 'Go back') menu()
            if(answers.settings == 'Reconnecting') {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            name: 'settings',
                            message: 'Should reconnecting be enabled?'
                        },
                    ])
                    .then((answers) => {
                        config.mario.reconnect = answers.settings
                        marioSettings()
                    });
            }
            if(answers.settings == 'Experimental section') {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            name: 'settings',
                            message: 'Should the experimental section be enabled?'
                        },
                    ])
                    .then((answers) => {
                        config.mario.showExperimental = answers.settings
                        marioSettings()
                    });
            }
            if(answers.settings == 'Goals section') {
                console.clear();
                console.log(`${chalk.green("Vukky Powered Up!")} ${chalk.blueBright("Settings")}`);
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            name: 'settings',
                            message: 'Should the goals section be enabled?'
                        },
                    ])
                    .then((answers) => {
                        config.mario.showGoals = answers.settings
                        marioSettings()
                    });
            }
        });
}