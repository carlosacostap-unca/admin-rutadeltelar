'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import { createRecordWithAudit, updateRecordWithAudit } from '@/lib/audit';
import Link from 'next/link';
import { canEditContent, canReviewContent } from '@/lib/permissions';
import MapPicker from '@/components/MapPicker';
import { CATAMARCA_DEPARTAMENTOS } from '@/types/estacion';

export default function CreateEstacionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [nombre, setNombre] = useState('');
  const [eslogan, setEslogan] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [descripcionGeneral, setDescripcionGeneral] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [estado, setEstado] = useState('borrador'); // estado inicial
  const [fotoPortada, setFotoPortada] = useState<File | null>(null);
  const [galeriaFotos, setGaleriaFotos] = useState<FileList | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/estaciones');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent, action: 'borrador' | 'continuar') => {
    e.preventDefault();
    if (!nombre || !localidad || !departamento) {
      setError('Nombre, localidad y departamento son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('eslogan', eslogan);
      formData.append('localidad', localidad);
      formData.append('departamento', departamento);
      formData.append('descripcion_general', descripcionGeneral);
      if (latitud) formData.append('latitud', latitud);
      if (longitud) formData.append('longitud', longitud);
      formData.append('estado', action === 'borrador' ? 'borrador' : estado);
      if (user?.id) {
        formData.append('created_by', user.id);
        formData.append('updated_by', user.id);
      }

      if (fotoPortada) {
        formData.append('foto_portada', fotoPortada);
      }

      if (galeriaFotos) {
        for (let i = 0; i < galeriaFotos.length; i++) {
          formData.append('galeria_fotos', galeriaFotos[i]);
        }
      }
      
      const record = await createRecordWithAudit('estaciones', formData, user);
      
      router.push('/estaciones');
    } catch (err: any) {
      console.error('Error creando estación:', err);
      setError(err?.response?.message || 'Error al crear la estación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || !canEditContent(user as any)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <h1 className="text-[32px] font-bold text-[var(--color-primary)] tracking-tight ml-4">
            Crear Estación
          </h1>
        </div>

        <div className="bg-[var(--color-surface-container)] p-8 rounded-md">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Nombre de la estación *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. Estación Belén"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Eslogan
                </label>
                <input
                  type="text"
                  value={eslogan}
                  onChange={(e) => setEslogan(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. Cuna del tejido catamarqueño"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Localidad *
                </label>
                <input
                  type="text"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. Belén, Catamarca"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Departamento *
                </label>
                <select
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="input-field w-full"
                  required
                >
                  <option value="">Selecciona un departamento</option>
                  {CATAMARCA_DEPARTAMENTOS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Descripción general
              </label>
              <textarea
                value={descripcionGeneral}
                onChange={(e) => setDescripcionGeneral(e.target.value)}
                className="input-field w-full min-h-[100px] resize-y"
                placeholder="Breve descripción de la estación..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Latitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. -27.0442"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. -67.7201"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Seleccionar ubicación en el mapa
              </label>
              <p className="text-sm text-[var(--color-outline)] mb-3">
                Haz clic en el mapa para establecer las coordenadas automáticamente.
              </p>
              <MapPicker 
                lat={latitud ? parseFloat(latitud) : null} 
                lng={longitud ? parseFloat(longitud) : null} 
                onLocationSelect={(lat, lng) => {
                  setLatitud(lat.toString());
                  setLongitud(lng.toString());
                }} 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-3 uppercase tracking-[0.05em]">
                Estado inicial
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="input-field w-full md:w-1/2"
              >
                <option value="borrador">Borrador</option>
                <option value="en_revision">En revisión</option>
                {canReviewContent(user as any) && (
                  <option value="aprobado">Aprobado</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Foto de portada (Opcional)
              </label>
              <div className="flex flex-col gap-4">
                {fotoPortada && (
                  <div className="aspect-square w-40 bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                    <img
                      src={URL.createObjectURL(fotoPortada)}
                      alt="Vista previa de la foto de portada"
                      className="object-contain w-full h-full p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setFotoPortada(null)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar foto de portada"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div>
                  <input
                    id="file-upload-portada-create"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFotoPortada(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload-portada-create')?.click()}
                    className="btn-secondary px-4 py-2 text-sm shadow-sm"
                  >
                    {fotoPortada ? 'Cambiar portada' : '+ Añadir portada'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                Selecciona una sola imagen para la portada principal de la estación.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Galería de fotos (Opcional)
              </label>
              <div className="flex flex-col gap-4">
                {galeriaFotos && galeriaFotos.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {Array.from(galeriaFotos).map((foto, index) => (
                      <div key={index} className="aspect-square w-32 bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                        <img
                          src={URL.createObjectURL(foto)}
                          alt={`Nueva foto de galería ${index + 1}`}
                          className="object-contain w-full h-full p-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const dt = new DataTransfer();
                            Array.from(galeriaFotos).filter((_, i) => i !== index).forEach(f => dt.items.add(f));
                            setGaleriaFotos(dt.files.length > 0 ? dt.files : null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar nueva foto de galería"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    id="file-upload-galeria-create"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const existingFotosCount = galeriaFotos?.length || 0;
                      const newFotosCount = e.target.files?.length || 0;

                      if (existingFotosCount + newFotosCount > 5) {
                        alert(`Puedes tener un máximo de 5 imágenes en la galería. Te quedan ${5 - existingFotosCount} espacios.`);
                      } else {
                        const dt = new DataTransfer();
                        if (galeriaFotos) {
                          Array.from(galeriaFotos).forEach(f => dt.items.add(f));
                        }
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(f => dt.items.add(f));
                        }
                        setGaleriaFotos(dt.files);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload-galeria-create')?.click()}
                    className="btn-secondary px-4 py-2 text-sm shadow-sm"
                  >
                    + Añadir foto
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                Puedes seleccionar hasta 5 imágenes para la galería.
              </p>
            </div>

            <div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
              <Link
                href="/estaciones"
                className="btn-secondary px-6 py-2 text-sm shadow-sm text-center"
              >
                Cancelar
              </Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'continuar')}
                disabled={isSubmitting}
                className="btn-primary px-6 py-2 text-sm shadow-md"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
