const fs = require('fs');

const path = 'src/data/cbtData.ts';
let content = fs.readFileSync(path, 'utf8');

// I will add a property `disabled: true` to the CBTTest interface and update the staticCbtTests to disable the 180 min tests

content = content.replace(
  "  isLocal?: boolean;\n  duration?: string;\n}",
  "  isLocal?: boolean;\n  duration?: string;\n  disabled?: boolean;\n}"
);

// We need to disable the ones matching the screenshot:
// Sexual Reproduction in Flowering Plant
// Molecular Basis of Inheritance
// Principle of Inheritance and Variation
// Microbes in Human Welfare
// Organisms and Population
// Ecosystem

const testsToDisable = [
  'Sexual_Reproduction_in_Flowering_Plant_Final',
  'Molecular_Basis_of_Inheritance_Final',
  'Principle_of_Inheritance_and_Variation_Final',
  'Microbes_in_Human_Welfare_Final',
  'Organisms_and_Population_Final',
  'Ecosystem_Final'
];

for (const test of testsToDisable) {
  const regex = new RegExp(`filename: '/cbts/Botany/Kattar Tests/${test}.html',\\s*subject: 'Botany',\\s*category: 'Kattar Tests',\\s*duration: '180 Mins',\\s*dateAdded: '([^']+)',`, 'g');
  
  content = content.replace(regex, (match, p1) => {
    return `filename: '/cbts/Botany/Kattar Tests/${test}.html',\n    subject: 'Botany',\n    category: 'Kattar Tests',\n    duration: '180 Mins',\n    dateAdded: '${p1}',\n    disabled: true,`;
  });
}

fs.writeFileSync(path, content);
console.log('Tests disabled in data file');
