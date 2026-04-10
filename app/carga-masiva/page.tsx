'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { canManageUsers } from '@/lib/permissions';
import { runSeed, SeedResult } from '@/lib/seedData';

export default function CargaMasivaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [prompt, setPrompt] = useState('');
  const [cleanData, setCleanData] = useState(false);
  const [createUsers, setCreateUsers] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !canManageUsers(user as any))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleRunSeed = async () => {
    if (!user) return;
    
    if (!window.confirm('¿Estás seguro de que deseas ejecutar la carga de datos sintéticos? Esto creará nuevos registros en la base de datos usando Inteligencia Artificial.')) {
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const res = await runSeed(user.id, prompt, { cleanData, createUsers });
      setResult(res);
    } catch (error) {
      console.error('Error in handleRunSeed:', error);
      alert('Ocurrió un error inesperado al ejecutar la carga.');
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading || !user || !canManageUsers(user as any)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface)]">
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-[32px] font-bold text-[var(--color-on-surface)] tracking-tight mb-2">
            Carga Masiva de Datos Sintéticos
          </h1>
          <p className="text-[var(--color-on-surface-variant)] text-lg">
            Esta herramienta permite poblar el sistema con datos de prueba estructurados. Se crearán estaciones, actores, productos, experiencias e imperdibles con relaciones coherentes.
          </p>
        </div>

        <div className="bg-[var(--color-surface-container)] p-8 rounded-md mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-4">Configuración</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="carga-ia"
                    type="radio"
                    checked
                    readOnly
                    className="focus:ring-[var(--color-primary)] h-4 w-4 text-[var(--color-primary)] border-[var(--color-outline)]"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="carga-ia" className="font-bold text-[var(--color-on-surface)]">
                    Carga Generativa (OpenAI)
                  </label>
                  <p className="text-[var(--color-on-surface-variant)] mt-1">
                    Crea estaciones base con actores, productos, experiencias e imperdibles interrelacionados utilizando Inteligencia Artificial.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="prompt" className="block text-sm font-bold text-[var(--color-on-surface)] mb-2">
                  Temática o contexto (Opcional)
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='Ej. "Quiero datos enfocados en turismo de aventura y alta montaña en Fiambalá"'
                  className="input-field min-h-[80px] w-full"
                />
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                  Puedes darle instrucciones a la IA para guiar el tipo de datos generados.
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--color-surface-variant)]">
                <h4 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">Opciones Adicionales</h4>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="clean-data"
                        type="checkbox"
                        checked={cleanData}
                        onChange={(e) => setCleanData(e.target.checked)}
                        className="focus:ring-[var(--color-primary)] h-4 w-4 text-[var(--color-primary)] border-[var(--color-outline)] rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="clean-data" className="font-bold text-[var(--color-on-surface)]">
                        Limpiar datos previos
                      </label>
                      <p className="text-[var(--color-on-surface-variant)] mt-1">
                        Eliminará todas las estaciones, actores, productos, experiencias e imperdibles existentes antes de cargar los nuevos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="create-users"
                        type="checkbox"
                        checked={createUsers}
                        onChange={(e) => setCreateUsers(e.target.checked)}
                        className="focus:ring-[var(--color-primary)] h-4 w-4 text-[var(--color-primary)] border-[var(--color-outline)] rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="create-users" className="font-bold text-[var(--color-on-surface)]">
                        Generar usuarios de prueba
                      </label>
                      <p className="text-[var(--color-on-surface-variant)] mt-1">
                        Creará usuarios con roles (admin, editor, revisor, consultor) si no existen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--color-surface-variant)] pt-8 mt-8">
            <button
              onClick={handleRunSeed}
              disabled={isRunning}
              className="btn-primary w-full md:w-auto flex justify-center items-center gap-2"
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ejecutando Carga...
                </>
              ) : (
                'Ejecutar Carga Sintética'
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-[var(--color-surface-container-low)] rounded-[8px] border border-[var(--color-outline-variant)] overflow-hidden">
            <div className="bg-[var(--color-primary-container)] px-6 py-4">
              <h3 className="text-lg font-bold text-[var(--color-on-primary-container)]">
                Resultados de la Carga
              </h3>
            </div>
            
            <div className="p-6">
              {result.errors.length > 0 ? (
                <div className="mb-6 bg-[var(--color-error-container)] p-4 rounded-md">
                  <h4 className="font-semibold text-[var(--color-on-error-container)] mb-2">
                    Se encontraron errores durante la ejecución:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-[var(--color-on-error-container)] space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mb-6 bg-[#e6f4ea] p-4 rounded-md text-[#137333] font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Carga ejecutada exitosamente sin errores
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div className="bg-[var(--color-surface)] p-4 rounded-md border border-[var(--color-outline-variant)] text-center">
                  <span className="block text-2xl font-bold text-[var(--color-primary)]">{result.estaciones}</span>
                  <span className="text-xs uppercase tracking-wider text-[var(--color-secondary)] font-semibold mt-1 block">Estaciones</span>
                </div>
                <div className="bg-[var(--color-surface)] p-4 rounded-md border border-[var(--color-outline-variant)] text-center">
                  <span className="block text-2xl font-bold text-[var(--color-primary)]">{result.actores}</span>
                  <span className="text-xs uppercase tracking-wider text-[var(--color-secondary)] font-semibold mt-1 block">Actores</span>
                </div>
                <div className="bg-[var(--color-surface)] p-4 rounded-md border border-[var(--color-outline-variant)] text-center">
                  <span className="block text-2xl font-bold text-[var(--color-primary)]">{result.productos}</span>
                  <span className="text-xs uppercase tracking-wider text-[var(--color-secondary)] font-semibold mt-1 block">Productos</span>
                </div>
                <div className="bg-[var(--color-surface)] p-4 rounded-md border border-[var(--color-outline-variant)] text-center">
                  <span className="block text-2xl font-bold text-[var(--color-primary)]">{result.experiencias}</span>
                  <span className="text-xs uppercase tracking-wider text-[var(--color-secondary)] font-semibold mt-1 block">Experiencias</span>
                </div>
                <div className="bg-[var(--color-surface)] p-4 rounded-md border border-[var(--color-outline-variant)] text-center">
                  <span className="block text-2xl font-bold text-[var(--color-primary)]">{result.imperdibles}</span>
                  <span className="text-xs uppercase tracking-wider text-[var(--color-secondary)] font-semibold mt-1 block">Imperdibles</span>
                </div>
                {(result.usuarios > 0 || result.deleted > 0) && (
                  <>
                    <div className="bg-[var(--color-surface)] p-4 rounded-md border border-[var(--color-outline-variant)] text-center col-span-2 sm:col-span-1">
                      <span className="block text-2xl font-bold text-[var(--color-primary)]">{result.usuarios}</span>
                      <span className="text-xs uppercase tracking-wider text-[var(--color-secondary)] font-semibold mt-1 block">Usuarios Creados</span>
                    </div>
                    <div className="bg-[var(--color-surface)] p-4 rounded-md border border-red-200 text-center col-span-2 sm:col-span-1">
                      <span className="block text-2xl font-bold text-red-600">{result.deleted}</span>
                      <span className="text-xs uppercase tracking-wider text-red-500 font-semibold mt-1 block">Registros Eliminados</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}