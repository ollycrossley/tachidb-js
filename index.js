// Packages
import {exec} from "child_process";
import chalk from "chalk"
import {promisify} from "util"
import inquirer from "inquirer"
import pressAnyKey from "press-any-key";

// Global Variables
const asyncExec = promisify(exec)
let currentDevice = ""

// Initial Setup

const SetDevice = async () => {
    console.clear()
    const deviceCmd = 'adb devices';
    const {stdout} = await asyncExec(deviceCmd)
    let cmdOut = stdout.split(/\r?\n/)
    cmdOut = cmdOut.filter(n => n)
    cmdOut.shift()
    cmdOut = cmdOut.map(device => {
        device = device.replace(/\s+/g, ' ');
        const deviceArr = device.split(" ")
        return {name: deviceArr[0], status: deviceArr[1]}
    })

    const deviceNames = cmdOut.map(device => device.name)
    console.log(chalk.bgWhiteBright.black('Devices:\n'));
    cmdOut.forEach(device => {
        console.log(`${device.name}\t${device.status === "offline" ? chalk.red("offline") : chalk.green("online")}`)
    })
    console.log(chalk.bgWhiteBright.black("\n########\n"))

    const {device} = await inquirer.prompt([{
        name: "device",
        choices: deviceNames,
        message: "Choose a device:",
        type: "list",
        prefix: null
    }])
    return device;
}

currentDevice = SetDevice()

// Menu
const Menu = async () => {
    console.clear()
    console.log(chalk.bgWhiteBright.black("Tachiyomi Package Manager\n\n")+chalk.bgBlueBright.whiteBright("Device:")+ " " + currentDevice)
    const {menuChoice} = await inquirer.prompt([{name: "menuChoice", choices: ["View Installed Packages", "Change Device", "Exit"], message: " ", type: "list", prefix: null}])

    switch (menuChoice) {
        case "View Installed Packages":
            const pkgCommand = `adb -s ${currentDevice} shell pm list packages -u --user 0`
            const {stdout} = await asyncExec(pkgCommand).catch(async (e) => {
                console.log(chalk.red("\nNo packages found!\n"))
                await pressAnyKey("Press any key to continue...")
                await Menu()
            })
            let rawPackages = stdout.split(/\r?\n/).sort()
            let packages = rawPackages.filter(n => n.includes("tachiyomi"))
            packages = packages.map(n => {
                if (n.includes("tachiyomi")) {
                    const newN = n.replace("package:", "")
                    return `${newN}`;
                }
            })
            console.log("")
            packages.forEach(p => {
                const pArray = p.split(".")
                if (pArray[pArray.length - 1].toUpperCase() !== "TACHIYOMI") {
                    console.log(`${chalk.blueBright(pArray[pArray.length - 1].toUpperCase())}: (${p})`)
                }
            })
            console.log("")
            await pressAnyKey("Press any key to continue...")
            await Menu();
            break;
        case "Change Device":
            /*const {device} = await inquirer.prompt([{
                name: "device",
                choices: deviceNames,
                message: "Choose a device:",
                type: "list",
                prefix: null
            }])
            currentDevice = device*/
            currentDevice = SetDevice()
            await Menu()
            break;
        default:
            process.exit()
            break;
    }
}

Menu()

