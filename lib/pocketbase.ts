import PocketBase from 'pocketbase';

// Se instancia el cliente de PocketBase
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// Desactivar la autocancelación globalmente para evitar errores en React Strict Mode (useEffect doble)
pb.autoCancellation(false);

export default pb;
