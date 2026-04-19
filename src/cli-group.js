const { Command } = require('commander');
const { registerGroupCommand } = require('./cli-group-handler');

const program = new Command();
registerGroupCommand(program);
program.parse(process.argv);
