# tabstack

CLI tool to save and restore browser tab sessions from the terminal.

## Installation

```bash
npm install -g tabstack
```

## Usage

Save your current browser tabs to a named session:

```bash
tabstack save work
```

List saved sessions:

```bash
tabstack list
```

Restore a session:

```bash
tabstack restore work
```

Delete a session:

```bash
tabstack delete work
```

Sessions are stored locally as JSON files in `~/.tabstack/`.

## Requirements

- Node.js 14+
- Chrome or Firefox with the tabstack browser extension installed

## License

MIT © tabstack contributors