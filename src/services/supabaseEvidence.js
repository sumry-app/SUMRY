import { supabase } from '../lib/supabase'

const BUCKET = 'evidence'

// Must stay in sync with the bucket's file_size_limit in
// supabase/migrations/002_rls_hardening_and_storage.sql
const MAX_FILE_BYTES = 25 * 1024 * 1024

// Storage RLS authorises against the FIRST path segment, so the layout
// `<studentId>/<progressLogId>/<file>` is load-bearing - changing it without
// also updating the storage policies will break access control.
function buildStoragePath(studentId, progressLogId, fileName) {
  const safeName = fileName
    .replace(/[^\w.\- ]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(-120)

  const unique =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e9)}`

  return `${studentId}/${progressLogId}/${unique}-${safeName}`
}

export const supabaseEvidenceAPI = {
  maxFileBytes: MAX_FILE_BYTES,

  // Uploads the file to Storage, then records it in the evidence table.
  upload: async ({ file, studentId, progressLogId, description = '' }) => {
    if (!file) throw new Error('No file provided')
    if (!studentId || !progressLogId) {
      throw new Error('studentId and progressLogId are required')
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Limit is ${MAX_FILE_BYTES / 1024 / 1024} MB.`
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const storagePath = buildStoragePath(studentId, progressLogId, file.name)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data, error } = await supabase
      .from('evidence')
      .insert({
        progress_log_id: progressLogId,
        file_name: file.name,
        file_path: storagePath,
        file_type: file.type || null,
        file_size: file.size,
        description,
        uploaded_by: user.id
      })
      .select()
      .single()

    // Don't leave an orphaned object behind if the metadata insert fails.
    if (error) {
      await supabase.storage.from(BUCKET).remove([storagePath])
      throw error
    }

    return {
      message: 'Evidence uploaded successfully',
      evidence: {
        id: data.id,
        progressLogId: data.progress_log_id,
        fileName: data.file_name,
        filePath: data.file_path,
        fileType: data.file_type,
        fileSize: data.file_size,
        description: data.description,
        createdAt: data.created_at
      }
    }
  },

  getByProgressLog: async (progressLogId) => {
    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .eq('progress_log_id', progressLogId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      evidence: data.map(item => ({
        id: item.id,
        progressLogId: item.progress_log_id,
        fileName: item.file_name,
        filePath: item.file_path,
        fileType: item.file_type,
        fileSize: item.file_size,
        description: item.description,
        createdAt: item.created_at
      }))
    }
  },

  // The bucket is private, so viewing requires a short-lived signed URL.
  getSignedUrl: async (filePath, expiresInSeconds = 3600) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, expiresInSeconds)

    if (error) throw error
    return { url: data.signedUrl }
  },

  updateDescription: async (evidenceId, description) => {
    const { data, error } = await supabase
      .from('evidence')
      .update({ description })
      .eq('id', evidenceId)
      .select()

    if (error) throw error
    // RLS denials affect zero rows without raising, so surface that explicitly.
    if (!data || data.length === 0) {
      throw new Error('Evidence not found or you do not have permission to edit it')
    }

    return { message: 'Description updated successfully' }
  },

  // Removes the DB row first; only deletes the object once that succeeds, so a
  // permission failure can't destroy the file.
  delete: async (evidenceId) => {
    const { data: record, error: fetchError } = await supabase
      .from('evidence')
      .select('file_path')
      .eq('id', evidenceId)
      .single()

    if (fetchError) throw fetchError

    const { data: deleted, error: deleteError } = await supabase
      .from('evidence')
      .delete()
      .eq('id', evidenceId)
      .select()

    if (deleteError) throw deleteError
    if (!deleted || deleted.length === 0) {
      throw new Error('Evidence not found or you do not have permission to delete it')
    }

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([record.file_path])

    // The record is already gone; a storage hiccup shouldn't fail the call.
    if (storageError) {
      console.warn('Evidence row deleted but file removal failed:', storageError.message)
    }

    return { message: 'Evidence deleted successfully' }
  }
}
