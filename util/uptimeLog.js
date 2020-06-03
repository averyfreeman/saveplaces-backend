const os = require('os');
const chalk = require('chalk');
const { DEV_MODE } = process.env;
const { red, yellow, green, magenta, blue } = chalk;
const { log } = console;

const time = new Date().toLocaleTimeString();
const date = new Date().toLocaleDateString();

const uptimeLog = listenPort => {
  log(`
  Express ${green('MERN API')} 
  hostname : port 
  ${red(os.hostname())} : ${yellow(listenPort)} 
  Last Restarted:
  ${magenta(time)} 
  ${blue(date)}`
  )
  if (DEV_MODE == 'true') {
    log(`${red(`  npm run dev mode`)}`);
  }
};

module.exports = uptimeLog;