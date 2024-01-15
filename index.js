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

    if (cmdOut.length === 0) {
        {
            console.log(chalk.bgRedBright.whiteBright("No devices found"))
            await pressAnyKey("Press any key to exit..")
            process.exit();
        }
    }

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

const GetPackages = async (currentDevice) => {
    const pkgCommand = `adb -s ${currentDevice} shell pm list packages -u --user 0`
    const {stdout} = await asyncExec(pkgCommand).catch(async () => {
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
    packages = packages.filter(p => {
        let pArr = p.split(".")
        if (pArr[pArr.length - 1] !== "tachiyomi") return p;
    })

    return packages
}

currentDevice = await SetDevice()

// Menu
const Menu = async () => {

    console.clear()
    let deviceNickname

    try {
        const {stdout} = await asyncExec(`adb -s ${currentDevice} shell getprop`)
        let rawDeviceInfo = stdout.split(/\r?\n/)
        deviceNickname = rawDeviceInfo.filter(n => n.includes("[ro.product.system.model]"))[0].replace("[ro.product.system.model]: ", "").replace(/[\[\]]/g, "");
    } catch (e) {
        deviceNickname = currentDevice
    }

    console.log(chalk.bgWhiteBright.black("Tachiyomi Package Manager\n\n") +
        chalk.bgBlueBright.whiteBright("Device:") + " " + deviceNickname + ` ${chalk.grey("("+currentDevice+")")}`)
    const {menuChoice} = await inquirer.prompt([{
        name: "menuChoice",
        choices: ["View Installed Packages", "Uninstall a Package", "Change Device", "Exit"],
        message: " ",
        type: "list",
        prefix: null
    }])

    try {
        if (menuChoice === "View Installed Packages") {
            const packages = await GetPackages(currentDevice);
            console.log("")
            packages.forEach(p => {
                const pArray = p.split(".")
                console.log(`${chalk.yellowBright(pArray[pArray.length - 1].toUpperCase())}: (${p})`)
            })
            console.log("")
            await pressAnyKey("Press any key to continue...")
            await Menu();

        } else if (menuChoice === "Uninstall a Package") {

            const packages = await GetPackages(currentDevice)

            const {packageChoice} = await inquirer.prompt([{
                name: "packageChoice",
                choices: [...packages, chalk.redBright("Exit")],
                message: "Choose a package to clean uninstall",
                type: "list",
                prefix: null,
                pageSize: 20
            }])

            packageChoice === chalk.redBright("Exit") ? await Menu() : null

            const cleanInstallCmd = `adb -s ${currentDevice} shell cmd package install-existing ${packageChoice} --user 0`
            const uninstallCmd = `adb -s ${currentDevice} shell pm uninstall ${packageChoice}`

            await asyncExec(cleanInstallCmd)
            console.log(chalk.yellowBright("Package cleaned..."))
            await asyncExec(uninstallCmd)
            console.log(chalk.greenBright("Package uninstalled!"))

            await pressAnyKey("Press any key to continue...")
            await Menu()

        } else if (menuChoice === "Change Device") {
            currentDevice = await SetDevice()
            await Menu()

        } else {
            console.clear()
            process.exit()
        }
    } catch (e) {
        console.clear()
        console.log("An fatal error has occurred! Refreshing...")
        await pressAnyKey("Press any key to refresh...")
        await Menu()
    }
}

await Menu()