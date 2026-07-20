# Message Format Standard

This document defines the plain-text markup standard used in all chat messages across the platform.

## Rules

All messages are plain text. The following conventions are parsed at display time only (no special storage format):

| Syntax          | Meaning                          | Example                          |
|-----------------|----------------------------------|----------------------------------|
| `*text*`        | Action / description / narration | `*He unsheathes his sword*`      |
| `//text`        | OOC (out-of-character) comment   | `This is bad //lol`              |
| plain text      | Dialogue / spoken words          | `"I don't know, sire."`          |

### Details

**Actions** (`*asterisks*`)
- Enclose actions, descriptions, or narrative text between asterisks.
- Rendered in italic with subdued color (like a stage direction).
- Example: `*She narrows her eyes* "You dare?"`

**OOC comments** (`//double slash`)
- Any text after `//` until the end of the line is an out-of-character comment.
- Rendered in a code-like style (e.g. monospace, distinct color).
- Can appear inline: `I win //not really`
- Can be a full line: `//OOC: going afk for a bit`

**Dialogue** (plain text)
- Everything that is not an action or OOC is dialogue.
- Rendered as regular chat text.

### Examples

| Raw message | Parsed segments |
|---|---|
| `Hello` | dialogue: "Hello" |
| `*waves*` | action: "waves" |
| `//brb` | ooc: "brb" |
| `*He smiles* "Hi!"` | action: "He smiles", dialogue: " \"Hi!\"" |
| `"Help!" //panic` | dialogue: "\"Help!\" ", ooc: "panic" |
| `*She runs* "Stop!" *he shouts*` | action, dialogue, action |

### Escaping

There is no escape mechanism. To display a literal `*` or `//`:
- For `*text*`, the parser only matches paired asterisks. A single `*` is treated as dialogue.
- For `//`, it cannot be escaped; use a different convention if a literal `//` is needed.
