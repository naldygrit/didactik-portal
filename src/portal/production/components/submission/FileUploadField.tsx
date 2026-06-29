import { useRef } from 'react';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const file = upload.status === 'idle' ? null : upload.file;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Master file <span className="text-red-500">*</span>
      </label>
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-indigo-400"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mxf,.mov,.mp4,.avi,.mkv"
          className="hidden"
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
      </div>

      {upload.status === 'uploading' && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Uploading in the background…</span>
            <span>{upload.percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
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
        <p className="mt-2 text-xs text-red-600">{upload.message} Click the box to retry.</p>
      )}
    </div>
  );
}
