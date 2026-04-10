const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://pocketbase-admin-rutadeltelar.acostaparra.com/');

async function test() {
  try {
    const result = await pb.collection('productos').getList(1, 1);
    console.log("Result:", result);
    if (result.items && result.items.length > 0) {
      console.log("Record fields:", Object.keys(result.items[0]));
    } else {
      console.log("No items returned. Maybe public access is denied or collection is empty?");
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}

test();
