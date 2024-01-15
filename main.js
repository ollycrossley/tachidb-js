import {exec} from "child_process";
import chalk from "chalk"
import {promisify} from "util"
import inquirer from "inquirer"

const cmd = 'adb devices';
const asynExec = promisify(exec)

/*exec(cmd, (error, stdout, stderr) => {
    let consoleArray = stdout.split(/\r?\n/)
    consoleArray = consoleArray.filter(n => n)
    consoleArray.shift()
    consoleArray = consoleArray.map(device => {
        device = device.replace(/\s+/g, ' ');
        const deviceArr = device.split(" ")
        return {name: deviceArr[0], status: deviceArr[1]}
    })

    const deviceNames = consoleArray.map(device => device.name)
    console.log(chalk.bgGreenBright('Devices:\n'));
    consoleArray.forEach(device => {

        console.log(`${device.name}\t${device.status === "offline" ? chalk.red("offline") : chalk.green("online")}`)
    })

    inquirer.prompt([{name: "deviceChoice", choices: deviceNames, message: "Choose a device:", type: "list"}]).then(() => {
        console.log("done")
    })

})*/

const {stdout} = await asynExec(cmd)

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

const {device} = await inquirer.prompt([{name: "device", choices: deviceNames, message: "Choose a device:", type: "list", prefix: null}])

console.clear()

console.log(chalk.bgWhiteBright.black("Tachiyomi Package Manager\n\n")+chalk.bgBlueBright.whiteBright("Device:")+ " " + device)

const {menuChoice} = await inquirer.prompt([{name: "menuChoice", choices: ["View Installed Packages", "Change Device", "Exit"], message: " ", type: "list", prefix: null}])



switch (menuChoice) {
    case "View Installed Packages":
        const pkgCommand = `adb -s ${device} shell pm list packages -u --user 0`
        const {stdout} = await asynExec(pkgCommand)
        let packages = stdout.split(/\r?\n/).sort()
        packages = packages.filter(n => {
            if (n.includes("tachiyomi")) return n;
        })
        console.log(packages)
}


