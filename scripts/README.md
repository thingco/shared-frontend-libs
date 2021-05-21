# Scripts

Scripts make use of the [`zx`](https://github.com/google/zx) package, a tiny
wrapper around a few common Node APIs that make writing Node scripts very
pleasant.

It has the ability to parse markdown files, so all scripts are written that way:
any code blocks are parsed out and concatenated. Top-level await is supprted,
as well as imports. Going forward I'm going to add [ink](https://github.com/vadimdemedes/ink)
for a nice CLI experience.
