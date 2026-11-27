// Image Generator API service

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/img-gen-api'
  : 'http://localhost:8003';

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

export async function initPipeline() {
  const response = await fetch(`${API_BASE_URL}/api/init-pipeline`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Pipeline init failed');
  return response.json();
}

export async function generateFromKorean(params, callbacks) {
  const { prompt_ko, creativity, width, height, num_inference_steps } = params;
  const { onTranslating, onTranslated, onGenerating, onComplete, onError } = callbacks;

  const response = await fetch(`${API_BASE_URL}/api/generate-from-korean`, {
    method: 'POST',
    headers: {
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt_ko,
      creativity,
      width,
      height,
      num_inference_steps,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No reader available');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      // Parse SSE event type (e.g., "event: translating")
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
        continue;
      }

      // Parse SSE data (e.g., "data: {...}")
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6);
        try {
          const data = JSON.parse(jsonStr);

          // Use the event type from "event:" line
          switch (currentEvent) {
            case 'translating':
              onTranslating?.();
              break;
            case 'translated':
              onTranslated?.(data);
              break;
            case 'generating':
              onGenerating?.();
              break;
            case 'complete':
              // Pass through image_base64 directly (already has data:image/png;base64, prefix from backend)
              onComplete?.(data);
              break;
            case 'error':
              onError?.(data.error || 'Unknown error');
              break;
            default:
              break;
          }
          currentEvent = null; // Reset after processing
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  }
}
