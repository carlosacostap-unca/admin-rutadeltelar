import PocketBase from 'pocketbase';

// Se instancia el cliente de PocketBase
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// Desactivar la autocancelación globalmente para evitar errores en React Strict Mode (useEffect doble)
pb.autoCancellation(false);

export async function updateRecordAndReload<T>(
  collectionName: string,
  recordId: string,
  data: Record<string, any>,
  expand?: string
): Promise<T> {
  const collection = pb.collection(collectionName);
  await collection.update(recordId, data);

  if (!expand) {
    return collection.getOne<T>(recordId, {
      requestKey: null,
    });
  }

  return collection.getOne<T>(recordId, {
    expand,
    requestKey: null,
  });
}

export default pb;
