import pb from '@/lib/pocketbase';

export interface SeedResult {
  estaciones: number;
  actores: number;
  productos: number;
  experiencias: number;
  imperdibles: number;
  usuarios: number;
  deleted: number;
  errors: string[];
}

export const runSeed = async (
  user_id: string, 
  prompt?: string,
  options?: { cleanData?: boolean; createUsers?: boolean }
): Promise<SeedResult> => {
  const result: SeedResult = {
    estaciones: 0,
    actores: 0,
    productos: 0,
    experiencias: 0,
    imperdibles: 0,
    usuarios: 0,
    deleted: 0,
    errors: [],
  };

  const handleError = (context: string, err: any) => {
    console.error(`Error en ${context}:`, err);
    let errorDetail = err.message || err.toString();
    if (err.response?.data) {
      errorDetail += ' - Detalles: ' + JSON.stringify(err.response.data);
    }
    result.errors.push(`${context}: ${errorDetail}`);
  };

  try {
    // 0.1. Limpiar datos previos si se solicita (US-40)
    if (options?.cleanData) {
      const collections = ['imperdibles', 'experiencias', 'productos', 'actores', 'estaciones'];
      for (const coll of collections) {
        try {
          const records = await pb.collection(coll).getFullList({ requestKey: null });
          for (const record of records) {
            await pb.collection(coll).delete(record.id, { requestKey: null });
            result.deleted++;
          }
        } catch (err) {
          handleError(`Limpieza de ${coll}`, err);
        }
      }
    }

    // 0.2. Crear usuarios de prueba si se solicita (US-39)
    if (options?.createUsers) {
      const testUsers = [
        { email: 'admin@rutadeltelar.com', password: 'password123', roles: ['admin'], nombre: 'Admin Prueba' },
        { email: 'editor@rutadeltelar.com', password: 'password123', roles: ['editor'], nombre: 'Editor Prueba' },
        { email: 'revisor@rutadeltelar.com', password: 'password123', roles: ['revisor'], nombre: 'Revisor Prueba' },
        { email: 'consultor@rutadeltelar.com', password: 'password123', roles: ['consultor'], nombre: 'Consultor Prueba' },
      ];

      for (const tu of testUsers) {
        try {
          // Verificar si existe
          const existing = await pb.collection('users').getList(1, 1, {
            filter: `email = "${tu.email}"`,
            requestKey: null
          });

          if (existing.items.length === 0) {
            await pb.collection('users').create({
              email: tu.email,
              emailVisibility: true,
              password: tu.password,
              passwordConfirm: tu.password,
              nombre: tu.nombre,
              roles: tu.roles,
            }, { requestKey: null });
            result.usuarios++;
          }
        } catch (err) {
          handleError(`Creación de usuario ${tu.email}`, err);
        }
      }
    }

    // 1. Obtener datos sintéticos desde la API Route de OpenAI
    const response = await fetch('/api/generate-seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Error desconocido al invocar la API.');
    }

    const data = await response.json();

    // Mapas para relacionar IDs generados por OpenAI (id_ref) con IDs reales de PocketBase
    const estacionesMap: Record<string, string> = {};
    const actoresMap: Record<string, string> = {};

    // 2. Insertar Estaciones
    for (const est of data.estaciones || []) {
      try {
        const record = await pb.collection('estaciones').create({
          nombre: est.nombre,
          localidad: est.localidad,
          descripcion_general: est.descripcion_general,
          mapas_referencias: est.mapas_referencias,
          coordenadas_generales: est.coordenadas_generales,
          estado: 'aprobado',
          created_by: user_id,
          updated_by: user_id,
        });
        estacionesMap[est.id_ref] = record.id;
        result.estaciones++;
      } catch (e) {
        handleError(`Estación ${est.nombre}`, e);
      }
    }

    // 3. Insertar Actores
    for (const act of data.actores || []) {
      try {
        const record = await pb.collection('actores').create({
          nombre: act.nombre,
          tipo: act.tipo,
          estacion_id: estacionesMap[act.estacion_ref],
          descripcion: act.descripcion,
          contacto_telefono: act.contacto_telefono,
          ubicacion: act.ubicacion,
          estado: 'aprobado',
          created_by: user_id,
          updated_by: user_id,
        });
        actoresMap[act.id_ref] = record.id;
        result.actores++;
      } catch (e) {
        handleError(`Actor ${act.nombre}`, e);
      }
    }

    // 4. Insertar Productos
    for (const prod of data.productos || []) {
      try {
        const actoresIds = (prod.actores_refs || [])
          .map((ref: string) => actoresMap[ref])
          .filter(Boolean);

        await pb.collection('productos').create({
          nombre: prod.nombre,
          categoria: prod.categoria,
          descripcion: prod.descripcion,
          estacion_id: estacionesMap[prod.estacion_ref],
          actores_relacionados: actoresIds,
          estado: 'aprobado',
          created_by: user_id,
          updated_by: user_id,
        });
        result.productos++;
      } catch (e) {
        handleError(`Producto ${prod.nombre}`, e);
      }
    }

    // 5. Insertar Experiencias
    for (const exp of data.experiencias || []) {
      try {
        await pb.collection('experiencias').create({
          titulo: exp.titulo,
          categoria: exp.categoria,
          descripcion: exp.descripcion,
          duracion: exp.duracion,
          recomendaciones: exp.recomendaciones,
          responsable: actoresMap[exp.responsable_ref],
          estacion_id: estacionesMap[exp.estacion_ref],
          ubicacion: exp.ubicacion,
          estado: 'aprobado',
          created_by: user_id,
          updated_by: user_id,
        });
        result.experiencias++;
      } catch (e) {
        handleError(`Experiencia ${exp.titulo}`, e);
      }
    }

    // 6. Insertar Imperdibles
    for (const imp of data.imperdibles || []) {
      try {
        await pb.collection('imperdibles').create({
          titulo: imp.titulo,
          tipo: imp.tipo,
          descripcion: imp.descripcion,
          motivo_destaque: imp.motivo_destaque,
          estacion_id: estacionesMap[imp.estacion_ref],
          prioridad: imp.prioridad,
          ubicacion: imp.ubicacion,
          estado: 'aprobado',
          created_by: user_id,
          updated_by: user_id,
        });
        result.imperdibles++;
      } catch (e) {
        handleError(`Imperdible ${imp.titulo}`, e);
      }
    }

  } catch (error) {
    handleError('Flujo de Carga (OpenAI)', error);
  }

  return result;
};