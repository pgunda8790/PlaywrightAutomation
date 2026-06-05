const { execSync } = require('child_process');

// Run Playwright tests — catch so we still generate the report even if tests fail
try {
  //execSync('npx playwright test', { stdio: 'inherit' });
const args = process.argv.slice(2).join(' ');
execSync(`npx playwright test ${args}`, { stdio: 'inherit' });

} catch {
  console.log('\nSome tests failed — generating Allure report anyway...\n');
}

// Generate and open the Allure report
execSync('npx allure generate reports/allure-results --clean -o reports/allure-report', { stdio: 'inherit' });
execSync('npx allure open reports/allure-report', { stdio: 'inherit' });
