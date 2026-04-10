const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://pocketbase-admin-rutadeltelar.acostaparra.com/');

async function test() {
  try {
    await pb.collection('estaciones').create({});
  } catch (err) {
    console.log(Object.keys(err));
    console.log('err.response:', err.response);
    console.log('err.data:', err.data);
    console.log('err.originalError:', err.originalError);
  }
}
test();