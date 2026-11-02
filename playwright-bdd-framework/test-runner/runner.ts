import { spawnSync } from 'node:child_process';
import path from 'node:path';

// This entry point invokes Cucumber's CLI; Playwright is only the browser automation library.
const cucumberCliPath = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '@cucumber',
  'cucumber',
  'bin',
  'cucumber.js'
);
const runnerArguments = [
  '--format',
  'html:reports/cucumber-report.html',
  ...process.argv.slice(2)
];

const result = spawnSync(process.execPath, [cucumberCliPath, ...runnerArguments], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
});

if (result.error) {
  console.error(`Could not start Cucumber: ${result.error.message}`);
  process.exitCode = 1;
} else if (result.status === null) {
  console.error('Cucumber did not return an exit status.');
  process.exitCode = 1;
} else {
  process.exitCode = result.status;
}
