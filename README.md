# 🦕 🤖 Midori

Midori is Anima's discord bot (not a maid, smh) Written like a framework over harmony running in Deno.

Midori also doubles down as a batteries included discord bot framework, allowing you to easily create your own discord bot without having to deal with writing a boilerplate.

---
## Features

> Midori loads, reloads and validates files automatically for most of the features it provides, you will never forget to import that one command before deploy again.

**Message commands**
- Automatically generated help commands
  - {{prefix}}help
  - {{prefix}}{{command}} --help
- Arguments
  - Named
  - Flag
  - Positional
- CoolDown
  - Per Role: Define specific coolDowns for each role.
  - Global: Prevent any user from running the same command for a specific amount of time.
  - Traditional: Prevent the same user from running the same command for a specific amount of time.
- Permission
  - Per Role: Allow only certain roles to use certain commands.
  - Bot Owner Only: Allow only the bot owner to use certain commands.
  - Guild Owner Only: Allow only the guild owner to use certain commands.

**Cron jobs**
  - Execute tasks by scheduling them.

**Webhooks**
  - Create & Listen for webhooks and respond to them, allowing you to easily connect your bot to other applications

**SQL Database**

**REAL i18n!**
  - Make your bot respond in the SAME LANGUAGE AS THE USER, not the guild.<br /> (this feature requires the guild to have language roles).

**Embed pagination**
  - Easily create paginated embeds calling just one function.

---
## Planned features
- Slash commands
- Allowing to register the same event multiple times
## Running

```bash
# Developer mode, watches for changes and reloads when files are saved.
deno task watch

# Production mode, does not reload on file changes.
deno task start
```
## Contributing
Feel free to fork this repository and not give us any credit, we don't care.

But if you did something cool with it, we would love to see it (and possibly merge?)!
