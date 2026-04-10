const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://pocketbase-admin-rutadeltelar.acostaparra.com/');

async function test() {
  try {
    const authData = await pb.admins.authWithPassword('admin@admin.com', 'admin1234'); // wait we don't know the password
  } catch (err) {
    console.error(err);
  }
}
test();