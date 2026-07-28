# coffee-tracker

Tiny Node.js CLI that records espresso brews to a plain-text log and prints
summaries.

```bash
node src/tracker.mjs --bean ethiopia --dose 18 --yield 36 --seconds 27
node src/report.mjs
```

No dependencies. The log is `brews.log` in the working directory.
