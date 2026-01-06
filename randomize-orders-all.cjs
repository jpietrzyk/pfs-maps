const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'public', 'orders-all.json');

function main() {
  const raw = fs.readFileSync(filePath, 'utf8');
  const orders = JSON.parse(raw);

  const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
  const priorities = ['low', 'medium', 'high'];

  const updated = orders.map((order, idx) => {
    const status = statuses[idx % statuses.length];
    const priority = priorities[(idx * 7) % priorities.length];
    return {
      ...order,
      status,
      priority,
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  console.log(`Updated ${updated.length} orders in orders-all.json`);
  const counts = updated.reduce((acc, o) => {
    acc.status[o.status] = (acc.status[o.status] || 0) + 1;
    acc.priority[o.priority] = (acc.priority[o.priority] || 0) + 1;
    return acc;
  }, { status: {}, priority: {} });
  console.log('Status distribution:', counts.status);
  console.log('Priority distribution:', counts.priority);
}

main();
