async function checkSchema() {
  const res = await fetch('http://127.0.0.1:8090/api/collections/productos');
  const data = await res.json();
  console.log(JSON.stringify(data.schema, null, 2));
}

checkSchema().catch(console.error);
