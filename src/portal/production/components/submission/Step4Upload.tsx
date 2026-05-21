import { useRef, useState } from 'react';
import { apiPost } from '../../../shared/apiHelpers';
import { apiFetch } from '../../../shared/api';
import type { UploadInitiatedResponse, ConfirmUploadResponse } from '../../../shared/types';
import type { WizardFormData } from '../../pages/SubmitPage';

type UploadPhase =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'uploading'; percent: number }
  | { kind: 'confirming' }
  | { kind: 'success'; assetId: number; message: string; needsReview: boolean }
  | { kind: 'error'; message: string };

interface Props {
  formData: WizardFormData;
  onBack: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Step4Upload({ formData, onBack }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>({ kind: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!file) return;

    setPhase({ kind: 'submitting' });

    // Step 1: POST to initiate-upload with all wizard data + file info
    const payload = {
      filename: file.name,
      content_type: file.type || 'application/octet-stream',
      title: formData.title,
      original_title: formData.original_title ?? '',
      asset_type: formData.asset_type,
      production_year: Number.isNaN(formData.production_year)
        ? undefined
        : formData.production_year ?? undefined,
      description: formData.description ?? '',
      submitter_name: formData.submitter_name,
      submitter_contact: formData.submitter_contact,
      consented: true,
    };

    let initiated: UploadInitiatedResponse;
    try {
      const { data, status } = await apiPost<UploadInitiatedResponse>(
        '/api/v1/assets/initiate-upload/',
        payload,
      );
      initiated = data;

      // 202 = PILOT/LIMITED jurisdiction — no upload URL, awaiting admin review
      if (status === 202) {
        setPhase({ kind: 'success', assetId: initiated.asset_id, message: initiated.message, needsReview: true });
        return;
      }
    } catch (err) {
      setPhase({ kind: 'error', message: err instanceof Error ? err.message : 'Submission failed.' });
      return;
    }

    if (!initiated.upload_url) {
      setPhase({ kind: 'error', message: 'No upload URL received. Please contact support.' });
      return;
    }

    // Step 2: XHR PUT directly to B2 (cross-origin — B2 CORS rules allow this)
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', initiated.upload_url!);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setPhase({ kind: 'uploading', percent: Math.round((e.loaded / e.total) * 100) });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`B2 upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        setPhase({ kind: 'uploading', percent: 0 });
        xhr.send(file);
      });
    } catch (err) {
      setPhase({ kind: 'error', message: err instanceof Error ? err.message : 'Upload to storage failed.' });
      return;
    }

    // Step 3: POST confirm-upload to transition asset to UPLOADED
    setPhase({ kind: 'confirming' });
    try {
      const res = await apiFetch(`/api/v1/assets/${initiated.asset_id}/confirm-upload/`, {
        method: 'POST',
      });
      const confirm = await res.json() as ConfirmUploadResponse;
      if (!res.ok) {
        throw new Error((confirm as { detail?: string }).detail ?? `Confirm failed (${res.status})`);
      }
      setPhase({
        kind: 'success',
        assetId: initiated.asset_id,
        message: confirm.message,
        needsReview: false,
      });
    } catch (err) {
      setPhase({ kind: 'error', message: err instanceof Error ? err.message : 'Upload confirmation failed.' });
    }
  }

  // Success state
  if (phase.kind === 'success') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="text-4xl">✓</div>
        <h3 className="text-lg font-semibold text-gray-900">
          {phase.needsReview ? 'Submission received' : 'Upload complete'}
        </h3>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">{phase.message}</p>
        <p className="text-xs text-gray-400">Asset ID: {phase.assetId}</p>
        <a
          href="/portal/production/assets"
          className="inline-block mt-2 px-5 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: '#5343fd' }}
        >
          View your assets
        </a>
      </div>
    );
  }

  const isWorking =
    phase.kind === 'submitting' ||
    phase.kind === 'uploading' ||
    phase.kind === 'confirming';

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700">
        Select the file to upload. Supported formats: video files (MP4, MOV, MXF, etc.).
      </p>

      {/* File picker */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
        onClick={() => !isWorking && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mxf,.mov,.mp4,.avi,.mkv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f);
              if (phase.kind === 'error') setPhase({ kind: 'idle' });
            }
          }}
          disabled={isWorking}
        />
        {file ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-400">
              {formatBytes(file.size)} · {file.type || 'unknown type'}
            </p>
            {!isWorking && (
              <p className="text-xs text-indigo-500 mt-2">Click to change file</p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Click to select file</p>
            <p className="text-xs text-gray-400">or drag and drop</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {phase.kind === 'uploading' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Uploading to storage…</span>
            <span>{phase.percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-100"
              style={{ width: `${phase.percent}%`, backgroundColor: '#5343fd' }}
            />
          </div>
        </div>
      )}

      {phase.kind === 'submitting' && (
        <p className="text-sm text-gray-500">Creating asset record…</p>
      )}
      {phase.kind === 'confirming' && (
        <p className="text-sm text-gray-500">Confirming upload…</p>
      )}

      {/* Error */}
      {phase.kind === 'error' && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{phase.message}</p>
          <p className="text-xs text-red-500 mt-1">
            Your metadata has been saved. Select the file again and retry.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isWorking}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!file || isWorking}
          className="px-5 py-2 rounded-md text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#5343fd' }}
        >
          {isWorking ? 'Working…' : 'Submit and upload'}
        </button>
      </div>
    </div>
  );
}
