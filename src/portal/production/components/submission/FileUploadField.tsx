import { useId } from 'react';
import { DkFieldError } from '../../../../components/dk/DkFieldError';

export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; percent: number; file: File }
  | { status: 'done'; fileKey: string; file: File }
  | { status: 'error'; message: string; file: File };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// The file picker sits on step 1 so the master streams to storage in the
// background while the filmmaker fills in the rest of the form (upload-first).
export function FileUploadField({
  upload,
  onPick,
}: {
  upload: UploadState;
  onPick: (file: File) => void;
}) {
  const inputId = useId();
  const file = upload.status === 'idle' ? null : upload.file;
  const hasError = upload.status === 'error';
  const errorId = hasError ? `${inputId}-error` : undefined;

  return (
    <div>
      {/* One <label> wrapping the whole dropzone: clicking anywhere (or
          focusing the visually-hidden input and pressing Enter/Space, which
          is native file-input behavior) opens the picker. No manual
          onClick/keydown handling needed, and the real input stays in the
          tab order via sr-only (clipped, not display:none like `hidden`). */}
      <label
        htmlFor={inputId}
        className="block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-indigo-400 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:ring-offset-2"
      >
        <span className="mb-1 block text-sm font-medium text-gray-700">
          Master file <span aria-hidden="true" className="text-red-500">*</span>
        </span>
        <input
          id={inputId}
          type="file"
          accept="video/*,.mxf,.mov,.mp4,.avi,.mkv"
          className="sr-only"
          aria-required
          aria-invalid={hasError || undefined}
          aria-describedby={errorId}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
          }}
        />
        {file ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            <p className="mt-1 text-xs text-indigo-500">Click to change file</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Click to choose your master file</p>
            <p className="text-xs text-gray-400">
              It uploads in the background while you fill in the details below.
            </p>
          </div>
        )}
      </label>

      {upload.status === 'uploading' && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Uploading in the background…</span>
            <span>{upload.percent}%</span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-gray-200"
            role="progressbar"
            aria-label="Upload progress"
            aria-valuenow={upload.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-2 rounded-full transition-all duration-150"
              style={{ width: `${upload.percent}%`, backgroundColor: '#5343fd' }}
            />
          </div>
        </div>
      )}
      {upload.status === 'done' && (
        <p className="mt-2 text-xs font-medium text-emerald-600">
          Upload complete. Finish the details and submit.
        </p>
      )}
      {upload.status === 'error' && (
        <DkFieldError id={errorId} className="mt-2 text-xs text-red-600">
          {upload.message} Click the box to retry.
        </DkFieldError>
      )}
    </div>
  );
}
