'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Producto, ProductoCategoria } from '@/types/producto';
import Header from '@/components/Header';
import { canEditContent } from '@/lib/permissions';

export default function ProductosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchProductos() {
      if (user) {
        try {
          const records = await pb.collection('productos').getFullList<Producto>({
            sort: '-created',
            expand: 'estacion_id,actores_relacionados',
            requestKey: null,
          });
          setProductos(records);
        } catch (error) {
          console.error('Error fetching productos:', error);
        } finally {
          setLoadingProductos(false);
        }
      }
    }
    fetchProductos();
  }, [user]);

  const toggleProductoStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('productos').update(id, { estado: newStatus });
      setProductos(productos.map(p => p.id === id ? { ...p, estado: newStatus } : p));
    } catch (error) {
      console.error('Error toggling producto status:', error);
      alert('Error al cambiar el estado del producto');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const canEdit = canEditContent(user as any);

  // Aplicar filtros
  const filteredProductos = productos.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter ? p.categoria === categoriaFilter : true;
    const matchesEstado = estadoFilter ? p.estado === estadoFilter : true;
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      textil: 'Textil',
      ceramica: 'Cerámica',
      madera: 'Madera',
      metal: 'Metal',
      cuero: 'Cuero',
      gastronomia: 'Gastronomía',
      otros: 'Otros'
    };
    return labels[categoria] || categoria;
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Productos
          </h2>
          {canEdit && (
            <Link
              href="/productos/create"
              className="btn-primary px-4 py-2 text-sm shadow-md"
            >
              + Nuevo Producto
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="textil">Textil</option>
            <option value="ceramica">Cerámica</option>
            <option value="madera">Madera</option>
            <option value="metal">Metal</option>
            <option value="cuero">Cuero</option>
            <option value="gastronomia">Gastronomía</option>
            <option value="otros">Otros</option>
          </select>
          <select
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="en_revision">En revisión</option>
            <option value="aprobado">Aprobado</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] overflow-hidden">
          {loadingProductos ? (
            <p className="p-8 text-center text-[var(--color-secondary)]">Cargando productos...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] text-[var(--color-secondary)] text-sm">
                  <th className="py-3 px-6 font-semibold">Nombre</th>
                  <th className="py-3 px-6 font-semibold">Categoría</th>
                  <th className="py-3 px-6 font-semibold">Estación</th>
                  <th className="py-3 px-6 font-semibold">Actores</th>
                  <th className="py-3 px-6 font-semibold">Estado</th>
                  <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-container-lowest)] transition-colors">
                    <td className="py-4 px-6 text-sm text-[var(--color-on-surface)] font-medium">{p.nombre}</td>
                    <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">{getCategoriaLabel(p.categoria)}</td>
                    <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">
                      {p.expand?.estacion_id?.nombre || <span className="text-[var(--color-outline)]">Sin estación</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">
                      {p.expand?.actores_relacionados ? p.expand.actores_relacionados.map(a => a.nombre).join(', ') : <span className="text-[var(--color-outline)]">Ninguno</span>}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${p.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                          p.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                          p.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {p.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/productos/${p.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-on-primary-container)] font-medium transition-colors">
                          Ver detalle
                        </Link>
                        {canEdit && (
                          <>
                            <Link href={`/productos/${p.id}/edit`} className="text-[var(--color-tertiary-fixed)] hover:text-[var(--color-on-tertiary-fixed-variant)] font-medium transition-colors">
                              Editar
                            </Link>
                            <button 
                              onClick={() => toggleProductoStatus(p.id, p.estado)}
                              className={`font-medium transition-colors ${p.estado === 'inactivo' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                            >
                              {p.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProductos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--color-secondary)]">
                      No hay productos registrados o que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}