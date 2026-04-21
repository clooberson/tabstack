const { program } = require('commander');
const { registerNamespaceCommand } = require('./cli-namespace-handler');

registerNamespaceCommand(program);
program.parse(process.argv);
