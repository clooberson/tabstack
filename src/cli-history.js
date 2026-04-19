const { Command } = require('commander');
const { registerHistoryCommand } = require('./cli-history-handler');

const program = new Command();
registerHistoryCommand(program);
program.parse(process.argv);
