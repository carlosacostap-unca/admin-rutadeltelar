const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://pocketbase-admin-rutadeltelar.acostaparra.com/');

async function test() {
  try {
    const authData = await pb.admins.authWithPassword('admin@rutadeltelar.com', 'Admin1234!');
    // wait I don't know the password
  } catch (err) {
    console.log(err.message);
  }
}
test();