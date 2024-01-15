# ADB-JS

## Introduction

ADB-JS is a small personal project to solve the issue of Tachiyomi packages breaking on specific android devices
when trying to upgrade to `0.15.0` or above. Due to the changes in package management within the app, devices like 
Samsung devices place heavy locks over package management from unauthorized apps. 

## Requirements

### ADB

This project requires a local installation of `adb` functionality. 

Please follow the instructions [here](https://www.xda-developers.com/install-adb-windows-macos-linux/#how-to-set-up-adb-on-your-computer)
for further instructions on how to set up ADB 

### NPM & Node

Make sure to setup NPM on your selected machine with [this](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) tutorial here.

### Node Packages

Now that you have Node and NPM working,
This project works on a number of packages, so please run `npm install` by opening command prompt in the project folder and running the command to ensure 
packages are installed correctly. 

## Running the Software

To run the software, open a command prompt from within the project folders and run `node main.js` and the software should run