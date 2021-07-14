// prettier-ignore
export const prepLog = (message) => console.log(chalk.magenta(
`[PREPARE]  ${message}`
));

// prettier-ignore
export const buildLog = (message) => console.log(chalk.cyan(
`[BUILD]    ${message}`
));

// prettier-ignore
export const finLog = (message) => console.log(chalk.green(
`[COMPLETE] ${message}`
));

// prettier-ignore
export const warnLog = (message) => console.log(chalk.yellow(
`[WARN]     ${message}`
));

// prettier-ignore
export const errLog = (message) => console.log(chalk.red(
`[ERROR]    ${message}`
));
