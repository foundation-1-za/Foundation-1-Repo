'use client';

import { useState, useCallback } from 'react';
import { useFileUpload } from '@/lib/storage/client';
import { createClient } from '@/lib/supabase/client';

interface UseDocumentUploadOptions {
  clientId: string;
  documentId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useDocumentUpload({
  clientId,
  documentId,
  onSuccess,
  onError,
}: UseDocumentUploadOptions) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const { uploadDocument } = useFileUpload();
  const supabase = createClient();

  const upload = useCallback(
    async (file: File, clientNotes?: string) => {
      setState({ isUploading: true, progress: 0, error: null });

      try {
        // Validate file
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File size must be less than 10MB');
        }

        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            'Invalid file type. Allowed: PDF, JPEG, PNG, WEBP, DOC, DOCX'
          );
        }

        // Simulate progress (since Supabase doesn't support upload progress yet)
        const progressInterval = setInterval(() => {
          setState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 90),
          }));
        }, 200);

        // Upload to storage
        const result = await uploadDocument(file, clientId);

        clearInterval(progressInterval);
        setState((prev) => ({ ...prev, progress: 95 }));

        // Update document record in database
        const { error: dbError } = await supabase
          .from('client_documents')
          .update({
            file_name: file.name,
            file_url: result.path,
            file_size: result.size,
            mime_type: result.mimeType,
            status: 'submitted',
            uploaded_at: new Date().toISOString(),
            client_notes: clientNotes || null,
          })
          .eq('id', documentId);

        if (dbError) {
          throw new Error(`Database update failed: ${dbError.message}`);
        }

        setState({ isUploading: false, progress: 100, error: null });
        onSuccess?.();

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
        });
        onError?.(errorMessage);
        throw err;
      }
    },
    [clientId, documentId, onSuccess, onError, supabase]
  );

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}

// Hook for admin to view and manage documents
export function useDocumentManager(clientId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { getSignedUrl, deleteFile } = useFileUpload();
  const supabase = createClient();

  const downloadDocument = useCallback(
    async (fileUrl: string, fileName?: string) => {
      setIsLoading(true);
      try {
        // Get signed URL for private bucket
        const signedUrl = await getSignedUrl('CLIENT_DOCUMENTS', fileUrl);

        // Download via fetch
        const response = await fetch(signedUrl);
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } finally {
        setIsLoading(false);
      }
    },
    [getSignedUrl]
  );

  const deleteDocument = useCallback(
    async (documentId: string, fileUrl?: string) => {
      setIsLoading(true);
      try {
        // Delete from database
        const { error: dbError } = await supabase
          .from('client_documents')
          .delete()
          .eq('id', documentId);

        if (dbError) {
          throw new Error(`Failed to delete document: ${dbError.message}`);
        }

        // Delete from storage if file exists
        if (fileUrl) {
          await deleteFile('CLIENT_DOCUMENTS', fileUrl);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [deleteFile, supabase]
  );

  return {
    isLoading,
    downloadDocument,
    deleteDocument,
  };
}
