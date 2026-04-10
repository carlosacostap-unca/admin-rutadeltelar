const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://pocketbase-admin-rutadeltelar.acostaparra.com/');

async function test() {
  try {
    const records = await pb.collection('productos').getList(1, 1);
    if (records.items.length > 0) {
      console.log(JSON.stringify(records.items[0], null, 2));
    } else {
      console.log('No records found in productos.');
    }
  } catch (err) {
    console.error('Error fetching records:', err.message);
  }
}
test();