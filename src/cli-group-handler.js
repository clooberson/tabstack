const { readSessions, writeSessions } = require('./storage');

function groupSessionsByTag(sessions) {
  const groups = {};
  for (const [name, session] of Object.entries(sessions)) {
    const tags = session.tags || [];
    if (tags.length === 0) {
      if (!groups['(untagged)']) groups['(untagged)'] = [];
      groups['(untagged)'].push(name);
    } else {
      for (const tag of tags) {
        if (!groups[tag]) groups[tag] = [];
        groups[tag].push(name);
      }
    }
  }
  return groups;
}

function registerGroupCommand(program) {
  program
    .command('group')
    .description('group sessions by tag and display them')
    .option('--tag <tag>', 'filter to a specific tag')
    .option('--json', 'output as JSON')
    .action((options) => {
      const sessions = readSessions();
      const groups = groupSessionsByTag(sessions);

      if (options.tag) {
        const filtered = {};
        if (groups[options.tag]) {
          filtered[options.tag] = groups[options.tag];
        } else {
          console.log(`No sessions found with tag: ${options.tag}`);
          return;
        }
        if (options.json) {
          console.log(JSON.stringify(filtered, null, 2));
        } else {
          printGroups(filtered, sessions);
        }
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(groups, null, 2));
      } else {
        printGroups(groups, sessions);
      }
    });
}

function printGroups(groups, sessions) {
  for (const [tag, names] of Object.entries(groups)) {
    console.log(`\n[${tag}]`);
    for (const name of names) {
      const count = (sessions[name].urls || []).length;
      console.log(`  ${name} (${count} url${count !== 1 ? 's' : ''})`);
    }
  }
}

module.exports = { groupSessionsByTag, registerGroupCommand };
