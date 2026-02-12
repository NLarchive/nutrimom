const fs = require('fs');
const path = require('path');

const targetsPath = path.join(__dirname, '../data/nutrient-targets.json');
const nutrientsPath = path.join(__dirname, '../data/nutrients.json');
const lifeStagesPath = path.join(__dirname, '../data/life-stages.json');

const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
const nutrients = JSON.parse(fs.readFileSync(nutrientsPath, 'utf8'));

// We want to find nutrients that are listed in 'nutrients.json' but often have no target in 'nutrient-targets.json'
// or have a target of 0/null.

const allNutrientKeys = Object.keys(nutrients);
const report = {};

// Iterate over each life stage group (e.g., 'infant', 'child', 'pregnancy')
for (const group in targets) {
    if (group === 'version') continue;
    
    // Iterate over subgroups (e.g., '0-6m', '1st-trimester')
    for (const subgroup in targets[group]) {
        const rules = targets[group][subgroup];
        const bandKey = `${group}/${subgroup}`;
        
        allNutrientKeys.forEach(nutKey => {
            const rule = rules[nutKey];
            
            // Check if missing or empty
            let hasTarget = false;
            if (rule) {
                if (rule.RDA > 0) hasTarget = true;
                if (rule.AI > 0) hasTarget = true;
                if (rule.UL > 0) hasTarget = true; // Even if it's just a limit, it's a target
                if (rule.MAX > 0) hasTarget = true;
            }

            if (!hasTarget) {
                if (!report[nutKey]) report[nutKey] = [];
                report[nutKey].push(bandKey);
            }
        });
    }
}

console.log("--- Nutrients with NO targets (RDA, AI, UL, MAX) in specific bands ---");
for (const [nut, bands] of Object.entries(report)) {
    // Only print if it's missing in A LOT of bands or specifically pregnancy/lactation which is our focus
    const maternityBands = bands.filter(b => b.includes('pregnancy') || b.includes('lactation'));
    if (maternityBands.length > 0) {
        console.log(`\n${nut} (${nutrients[nut]?.name || nut}):`);
        console.log(`  Missing in: ${maternityBands.join(', ')}`);
    }
}
