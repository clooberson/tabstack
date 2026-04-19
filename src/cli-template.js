const { Command } = require('commander');
const { registerTemplateCommand } = require('./cli-template-handler');

const program = new Command();
registerTemplateCommand(program);
program.parse(process.argv);
