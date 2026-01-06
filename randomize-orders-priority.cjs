const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'public', 'orders.json');

function main() {
  const raw = fs.readFileSync(filePath, 'utf8');
  const orders = JSON.parse(raw);

  const priorities = ['low', 'medium', 'high'];
  const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];

  // Rotate priorities and statuses deterministically so we get a nice spread
  const updated = orders.map((order, idx) => ({
    ...order,
    priority: priorities[idx % priorities.length],
    status: statuses[idx % statuses.length],
  }));

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  const counts = updated.reduce((acc, o) => {
    acc.priority[o.priority] = (acc.priority[o.priority] || 0) + 1;
    acc.status[o.status] = (acc.status[o.status] || 0) + 1;
    return acc;
  }, { priority: {}, status: {} });
  console.log(`Updated ${updated.length} orders in orders.json`);
  console.log('Priority distribution:', counts.priority);
  console.log('Status distribution:', counts.status);
}

main();
