import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export interface ProgressPayload {
  job_id: string;
  message: string;
  progress?: number;
}

export function onProgress(
  jobId: string,
  callback: (payload: ProgressPayload) => void,
): Promise<UnlistenFn> {
  return listen<ProgressPayload>(`friedman://progress/${jobId}`, (event) => {
    callback(event.payload);
  });
}
