const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://pocketbase-admin-rutadeltelar.acostaparra.com/');

async function test() {
  try {
    const collections = await pb.collections.getFullList({
      sort: '-created',
    });
    const productos = collections.find(c => c.name === 'productos');
    console.log(JSON.stringify(productos.schema, null, 2));
  } catch (err) {
    console.error('Error fetching collections:', err.message);
  }
}
test();