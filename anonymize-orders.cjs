const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'public', 'orders.json');

function anonymizeName(fullName) {
  if (!fullName || fullName.length === 0) return fullName;
  // Keep last 2 characters, replace rest with asterisks
  if (fullName.length <= 2) {
    return '*'.repeat(fullName.length);
  }
  const lastTwo = fullName.slice(-2);
  const asterisks = '*'.repeat(fullName.length - 2);
  return asterisks + lastTwo;
}

function main() {
  const raw = fs.readFileSync(filePath, 'utf8');
  const orders = JSON.parse(raw);

  const updated = orders.map((order) => ({
    ...order,
    customer: anonymizeName(order.customer),
  }));

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  console.log(`Anonymized ${updated.length} customer records in orders.json`);
  console.log('Sample anonymization:');
  console.log(`  Original: Fanczi Lászlóné → ${anonymizeName('Fanczi Lászlóné')}`);
  console.log(`  Original: Lecourbe Paul → ${anonymizeName('Lecourbe Paul')}`);
}

main();
