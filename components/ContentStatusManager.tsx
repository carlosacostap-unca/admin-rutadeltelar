import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { canEditContent, canReviewContent } from '@/lib/permissions';
import pb from '@/lib/pocketbase';

interface RejectionEntry {
  fecha: string;
  revisor: string;
  comentario: string;
}

interface ContentStatusManagerProps {
  collectionName: string;
  recordId: string;
  currentState: string;
  observaciones?: string;
  user: any;
  onStatusChange: (updatedRecord: any) => void;
}

function parseObservaciones(raw?: string): RejectionEntry[] {
  if (!raw || raw.trim() === '') return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as RejectionEntry[];
    // JSON válido pero no array: tratar como texto legacy
    return [{ fecha: '', revisor: '', comentario: raw }];
  } catch {
    // Texto plano legacy
    return [{ fecha: '', revisor: '', comentario: raw }];
  }
}

export default function ContentStatusManager({
  collectionName,
  recordId,
  currentState,
  observaciones,
  user,
  onStatusChange
}: ContentStatusManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const router = useRouter();

  const canEdit = canEditContent(user);
  const canReview = canReviewContent(user);

  const rejectionHistory = parseObservaciones(observaciones);

  const handleStatusChange = async (newState: string, reason: string = '') => {
    if (!recordId) return;
    
    setIsSubmitting(true);
    try {
      const dataToUpdate: any = {
        estado: newState,
        updated_by: user.id
      };
      
      if (newState === 'borrador' && reason) {
        const newEntry: RejectionEntry = {
          fecha: new Date().toISOString(),
          revisor: user.name || user.email || 'Revisor',
          comentario: reason,
        };
        dataToUpdate.observaciones_revision = JSON.stringify([newEntry, ...rejectionHistory]);
      }
      // Al enviar a revisión o aprobar no se borra el historial

      const updatedRecord = await pb.collection(collectionName).update(recordId, dataToUpdate);
      onStatusChange(updatedRecord);
      setShowRejectModal(false);
      setRejectReason('');
      
      // Redirigir al listado después de cualquier cambio de estado
      router.push(`/${collectionName}`);
    } catch (error) {
      console.error('Error changing status:', error);
      alert('Error al cambiar el estado del contenido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        {/* Enviar a revisión */}
        {canEdit && currentState === 'borrador' && (
          <button
            onClick={() => handleStatusChange('en_revision')}
            disabled={isSubmitting}
            className="btn-primary px-4 py-2 text-sm shadow-md bg-blue-600 hover:bg-blue-700"
          >
            Enviar a revisión
          </button>
        )}

        {/* Enviar a revisión desde aprobado */}
        {(canEdit || canReview) && currentState === 'aprobado' && (
          <button
            onClick={() => handleStatusChange('en_revision')}
            disabled={isSubmitting}
            className="btn-primary px-4 py-2 text-sm shadow-md bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : 'Enviar a revisión'}
          </button>
        )}

        {/* Aprobar */}
        {canReview && currentState === 'en_revision' && (
          <button
            onClick={() => handleStatusChange('aprobado')}
            disabled={isSubmitting}
            className="btn-primary px-4 py-2 text-sm shadow-md bg-green-600 hover:bg-green-700"
          >
            Aprobar
          </button>
        )}

        {/* Rechazar */}
        {canReview && currentState === 'en_revision' && (
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isSubmitting}
            className="font-medium transition-colors px-4 py-2 border rounded-full text-sm border-red-600 text-red-600 hover:bg-red-50"
          >
            Rechazar
          </button>
        )}
      </div>

      {/* Historial de rechazos — botón visible cuando hay entradas */}
      {rejectionHistory.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors"
          >
            Ver historial de rechazos ({rejectionHistory.length})
          </button>
        </div>
      )}

      {/* Modal historial de rechazos */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface-container)] rounded-lg p-6 max-w-lg w-full shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Historial de rechazos</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {rejectionHistory.map((entry, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  {entry.fecha ? (
                    <div className="flex justify-between text-xs text-red-600 mb-1 font-medium">
                      <span>{entry.revisor}</span>
                      <span>{new Date(entry.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-red-500 italic block mb-1">Observación anterior</span>
                  )}
                  <p>{entry.comentario}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface-container)] rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rechazar contenido</h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor, indica el motivo del rechazo. Esta observación será visible para el editor.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] mb-4"
              placeholder="Escribe las observaciones aquí..."
              required
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleStatusChange('borrador', rejectReason)}
                disabled={!rejectReason.trim() || isSubmitting}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
