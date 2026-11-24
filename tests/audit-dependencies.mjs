// npm audit reports known vulnerabilities without installing package scripts.
// Advisory findings are explicitly reported; registry or malformed output errors fail.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';

mkdirSync('audit-reports', { recursive: true });
for (const [name, extra] of [['all', []], ['production', ['--omit=dev']]]) {
  const result = spawnSync('npm', ['audit', '--json', '--package-lock-only', ...extra], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 180_000
  });
  writeFileSync(`audit-reports/${name}.json`, result.stdout || '');
  if (result.error) throw result.error;
  if (![0, 1].includes(result.status)) throw new Error(`npm audit failed: ${result.stderr}`);
  const report = JSON.parse(result.stdout);
  const counts = report.metadata?.vulnerabilities;
  if (report.error || !counts || !Number.isInteger(counts.total)) {
    throw new Error(`Invalid audit response for ${name}: ${result.stderr}`);
  }
  const summary = `### ${name}\nCritical: ${counts.critical}; High: ${counts.high}; Moderate: ${counts.moderate}; Low: ${counts.low}; Total: ${counts.total}\n`;
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  if (counts.critical || counts.high) {
    console.log(`::warning::${name} dependencies contain high or critical advisories; review the artifact before release.`);
  }
}
