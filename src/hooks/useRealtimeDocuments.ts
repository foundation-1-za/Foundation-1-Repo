'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRealtime } from '@/lib/realtime/context';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ClientDocument = Database['public']['Tables']['client_documents']['Row'];

interface UseRealtimeDocumentsOptions {
  clientId: string;
  onDocumentUpdate?: (document: ClientDocument) => void;
}

export function useRealtimeDocuments({ clientId, onDocumentUpdate }: UseRealtimeDocumentsOptions) {
  const supabase = createClient();
  const { subscribeToTable } = useRealtime();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);

  // Load initial documents
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Failed to load documents:', error);
      } else {
        setDocuments(data || []);
        updateCounts(data || []);
      }
      setIsLoading(false);
    };

    loadDocuments();
  }, [clientId, supabase]);

  // Update counts
  const updateCounts = useCallback((docs: ClientDocument[]) => {
    setPendingCount(docs.filter((d) => d.status === 'pending').length);
    setSubmittedCount(docs.filter((d) => d.status === 'submitted').length);
  }, []);

  // Subscribe to document changes
  useEffect(() => {
    const unsubscribe = subscribeToTable(
      'client_documents',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const newDoc = payload.new as ClientDocument;
          setDocuments((prev) => [newDoc, ...prev]);
          updateCounts([newDoc, ...documents]);
          onDocumentUpdate?.(newDoc);
        } else if (payload.eventType === 'UPDATE') {
          const updatedDoc = payload.new as ClientDocument;
          setDocuments((prev) => {
            const updated = prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
            updateCounts(updated);
            return updated;
          });
          onDocumentUpdate?.(updatedDoc);
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.old.id;
          setDocuments((prev) => {
            const filtered = prev.filter((d) => d.id !== deletedId);
            updateCounts(filtered);
            return filtered;
          });
        }
      },
      `client_id=eq.${clientId}`
    );

    return () => {
      unsubscribe();
    };
  }, [clientId, subscribeToTable, onDocumentUpdate, documents, updateCounts]);

  // Approve document
  const approveDocument = useCallback(
    async (documentId: string, adminNotes?: string) => {
      const { data, error } = await supabase
        .from('client_documents')
        .update({
          status: 'approved',
          admin_notes: adminNotes || null,
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    [supabase]
  );

  // Reject document
  const rejectDocument = useCallback(
    async (documentId: string, adminNotes?: string) => {
      const { data, error } = await supabase
        .from('client_documents')
        .update({
          status: 'rejected',
          admin_notes: adminNotes || null,
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    [supabase]
  );

  // Request new document
  const requestDocument = useCallback(
    async (type: string, name: string, description?: string) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('client_documents')
        .insert({
          client_id: clientId,
          type: type as 'id_document' | 'proof_of_address' | 'financial_statement' | 'company_registration' | 'tax_certificate' | 'contract' | 'other',
          name,
          description: description || '',
          status: 'pending',
          requested_by: user.user?.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    [clientId, supabase]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (documentId: string) => {
      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw new Error(error.message);
      }
    },
    [supabase]
  );

  return {
    documents,
    isLoading,
    pendingCount,
    submittedCount,
    approveDocument,
    rejectDocument,
    requestDocument,
    deleteDocument,
  };
}
