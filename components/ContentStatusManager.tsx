import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { canEditContent, canReviewContent } from '@/lib/permissions';
import pb from '@/lib/pocketbase';

interface ContentStatusManagerProps {
  collectionName: string;
  recordId: string;
  currentState: string;
  observaciones?: string;
  expand?: string;
  user: any;
  onStatusChange: (updatedRecord: any) => void;
}

export default function ContentStatusManager({
  collectionName,
  recordId,
  currentState,
  observaciones,
  expand,
  user,
  onStatusChange
}: ContentStatusManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const router = useRouter();

  const canEdit = canEditContent(user);
  const canReview = canReviewContent(user);

  const handleStatusChange = async (newState: string, reason: string = '') => {
    if (!recordId) return;
    
    setIsSubmitting(true);
    try {
      const dataToUpdate: any = {
        estado: newState,
        updated_by: user.id
      };
      
      if (newState === 'borrador' && reason) {
        dataToUpdate.observaciones_revision = reason;
      } else if (newState === 'en_revision' || newState === 'aprobado') {
        dataToUpdate.observaciones_revision = ''; // Clear previous reasons
      }

      const updatedRecord = await pb.collection(collectionName).update(recordId, dataToUpdate);
      const hydratedRecord = expand
        ? await pb.collection(collectionName).getOne(recordId, {
            expand,
            requestKey: null,
          })
        : updatedRecord;

      onStatusChange(hydratedRecord);
      setShowRejectModal(false);
      setRejectReason('');
      
      // Redirect to collection list if approved
      if (newState === 'aprobado') {
        router.push(`/${collectionName}`);
      }
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

      {/* Mostrar observaciones si existen y está en borrador */}
      {currentState === 'borrador' && observaciones && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
          <span className="font-semibold block mb-1">Observaciones de revisión:</span>
          {observaciones}
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
