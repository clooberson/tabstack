const { getSession } = require('./storage');

function validateSession(name) {
  const session = getSession(name);
  if (!session) {
    return { valid: false, error: `Session "${name}" not found` };
  }

  const issues = [];

  if (!session.urls || !Array.isArray(session.urls)) {
    issues.push('urls field is missing or not an array');
  } else {
    session.urls.forEach((url, i) => {
      try {
        new URL(url);
      } catch {
        issues.push(`url[${i}] is invalid: "${url}"`);
      }
    });

    if (session.urls.length === 0) {
      issues.push('session has no urls');
    }
  }

  if (!session.createdAt) {
    issues.push('missing createdAt timestamp');
  }

  return {
    valid: issues.length === 0,
    issues,
    urlCount: session.urls ? session.urls.length : 0,
  };
}

function registerValidateCommand(program) {
  program
    .command('validate <name>')
    .description('check a session for issues')
    .action((name) => {
      const result = validateSession(name);
      if (result.error) {
        console.error(result.error);
        process.exit(1);
      }
      if (result.valid) {
        console.log(`✓ Session "${name}" is valid (${result.urlCount} urls)`);
      } else {
        console.log(`✗ Session "${name}" has issues:`);
        result.issues.forEach((issue) => console.log(`  - ${issue}`));
        process.exit(1);
      }
    });
}

module.exports = { validateSession, registerValidateCommand };
