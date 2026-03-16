const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'data', 'tax_rules.json');
const rules = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const corpRates = {
  US: 0.21,
  GB: 0.20,
  DE: 0.15,
  FR: 0.25,
  IT: 0.24,
  ES: 0.25,
  CA: 0.15,
  AU: 0.30,
  JP: 0.23,
  IN: 0.25,
  BR: 0.34,
  SG: 0.17,
  NL: 0.25,
  SE: 0.20,
  NO: 0.22,
  DK: 0.22,
  CH: 0.08,
  NZ: 0.28,
  ZA: 0.27,
  AE: 0.09
};

rules.forEach(r => {
  r.corporate_tax_rate = corpRates[r.country] || 0.20;
});

fs.writeFileSync(filePath, JSON.stringify(rules, null, 2));
console.log('Updated tax rules successfully!');
