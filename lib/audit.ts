import pb from './pocketbase';

// Función para obtener el nombre del rol principal (o todos)
const getRoleString = (user: any) => {
  if (!user) return 'desconocido';
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.join(', ');
  }
  return 'sin_rol';
};

// Función para determinar el flujo de revisión
const determineAccion = (oldRecord: any, newRecord: any, defaultAccion: string) => {
  if (oldRecord && oldRecord.estado && newRecord && newRecord.estado) {
    const oldEstado = oldRecord.estado;
    const newEstado = newRecord.estado;
    
    if (oldEstado !== newEstado) {
      if (oldEstado === 'borrador' && newEstado === 'en_revision') return 'enviar_a_revision';
      if (oldEstado === 'borrador' && newEstado === 'aprobado') return 'aprobado_directamente';
      if (oldEstado === 'en_revision' && newEstado === 'aprobado') return 'aprobado_desde_revision';
      if (oldEstado === 'en_revision' && newEstado === 'borrador') return 'rechazar_a_borrador';
      if (oldEstado === 'aprobado' && newEstado === 'inactivo') return 'desactivar';
      if (oldEstado === 'inactivo' && newEstado === 'aprobado') return 'reactivar';
      return `cambio_estado: ${oldEstado} -> ${newEstado}`;
    }
  } else if (!oldRecord && newRecord && newRecord.estado) {
    return `crear (estado: ${newRecord.estado})`;
  }
  
  return defaultAccion;
};

export async function createRecordWithAudit(collection: string, data: FormData | any, user: any) {
  const record = await pb.collection(collection).create(data);
  
  try {
    await pb.collection('auditoria').create({
      entidad: collection,
      registro_id: record.id,
      accion: determineAccion(null, record, 'crear'),
      usuario: user?.id || '',
      rol_usuario: getRoleString(user),
      datos_anteriores: null,
      datos_nuevos: record,
    });
  } catch (e) {
    console.error('Error guardando auditoría', e);
  }
  
  return record;
}

export async function updateRecordWithAudit(collection: string, id: string, data: FormData | any, user: any) {
  let oldRecord = null;
  try {
    oldRecord = await pb.collection(collection).getOne(id);
  } catch (e) {
    console.warn('No se pudo obtener el registro anterior para auditoría', e);
  }
  
  const record = await pb.collection(collection).update(id, data);
  
  try {
    await pb.collection('auditoria').create({
      entidad: collection,
      registro_id: record.id,
      accion: determineAccion(oldRecord, record, 'editar'),
      usuario: user?.id || '',
      rol_usuario: getRoleString(user),
      datos_anteriores: oldRecord,
      datos_nuevos: record,
    });
  } catch (e) {
    console.error('Error guardando auditoría', e);
  }
  
  return record;
}

export async function deleteRecordWithAudit(collection: string, id: string, user: any) {
  let oldRecord = null;
  try {
    oldRecord = await pb.collection(collection).getOne(id);
  } catch (e) {
    console.warn('No se pudo obtener el registro anterior para auditoría', e);
  }
  
  await pb.collection(collection).delete(id);
  
  try {
    await pb.collection('auditoria').create({
      entidad: collection,
      registro_id: id,
      accion: 'eliminar',
      usuario: user?.id || '',
      rol_usuario: getRoleString(user),
      datos_anteriores: oldRecord,
      datos_nuevos: null,
    });
  } catch (e) {
    console.error('Error guardando auditoría', e);
  }
}
