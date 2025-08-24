import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';
import os from 'os';
import type { Plugin } from 'vite';
import fg from 'fast-glob';

interface WorkerResult {
  success: boolean;
  results?: unknown;
  error?: string;
  file?: string;
  outputPath?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a pool of workers for parallel OG image generation
 */
const createWorkerPool = (workerCount: number, workerScript: string) => {
  const workers: Worker[] = [];
  const queue: Array<{
    files: string[];
    background: string;
    font: Buffer;
    contentDir: string;
    outputDir: string;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  let activeWorkers = 0;

  // Create workers
  for (let i = 0; i < workerCount; i++) {
    const worker = new Worker(workerScript);
    workers.push(worker);
  }

  const processNext = () => {
    if (queue.length === 0 || activeWorkers >= workerCount) {
      return;
    }

    const task = queue.shift()!;
    const worker = workers[activeWorkers];
    if (worker == null) {
      task.reject(new Error('No worker available'));
      return;
    }
    activeWorkers++;

    worker.once('message', (result: WorkerResult) => {
      activeWorkers--;
      if (result.success) {
        task.resolve(result.results);
      } else {
        task.reject(new Error(result.error ?? 'Unknown worker error'));
      }
      processNext();
    });

    worker.once('error', (error) => {
      activeWorkers--;
      task.reject(error);
      processNext();
    });

    worker.postMessage({
      files: task.files,
      background: task.background,
      font: task.font,
      contentDir: task.contentDir,
      outputDir: task.outputDir,
    });
  };

  const addTask = (
    files: string[],
    background: string,
    font: Buffer,
    contentDir: string,
    outputDir: string,
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      queue.push({ files, background, font, contentDir, outputDir, resolve, reject });
      processNext();
    });
  };

  const terminate = async () => {
    await Promise.all(workers.map((worker) => worker.terminate()));
  };

  return { addTask, terminate };
};

/**
 * Split array into chunks
 */
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export type ViteOGImageOptions = {
  contentDir?: string;
  outputDir?: string;
};

export const viteOGImagePlugin = ({
  contentDir = 'content',
  outputDir = 'dist',
}: ViteOGImageOptions = {}): Plugin => {
  return {
    name: 'vite-ogimage',
    apply: 'build',
    async closeBundle() {
      const startTime = Date.now();

      try {
        console.log('Starting OG image generation with Worker Threads...');

        // Find all markdown files in content directory
        const markdownFiles = await fg(`${contentDir}/**/*.md`);
        console.log(`Found ${markdownFiles.length} markdown files`);

        // Load assets
        const backgroundPath = path.resolve(__dirname, './assets/background.png');
        const fontPath = path.resolve(__dirname, './assets/NotoSansJP-Bold.otf');

        const [background, font] = await Promise.all([
          fs.readFile(backgroundPath, 'base64'),
          fs.readFile(fontPath),
        ]);

        // Convert background to data URL
        const backgroundDataUrl = `data:image/png;base64,${background}`;

        // Calculate optimal worker count and chunk size
        const cpuCount = os.cpus().length;
        const workerCount = Math.min(cpuCount, markdownFiles.length);
        const chunkSize = Math.ceil(markdownFiles.length / workerCount);

        console.log(`Using ${workerCount} workers with chunk size ${chunkSize}`);

        // Create worker pool
        const workerScript = path.resolve(__dirname, './ogimage-worker.js');
        const pool = createWorkerPool(workerCount, workerScript);

        // Split files into chunks for parallel processing
        const fileChunks = chunkArray(markdownFiles, chunkSize);

        // Process all chunks in parallel
        const allResults = await Promise.all(
          fileChunks.map((chunk) =>
            pool.addTask(chunk, backgroundDataUrl, font, contentDir, outputDir),
          ),
        );

        // Terminate workers
        await pool.terminate();

        // Collect and report results
        const results = allResults.flat() as WorkerResult[];
        const successful = results.filter((r: WorkerResult) => r.success);
        const failed = results.filter((r: WorkerResult) => !r.success);

        console.log(`Generated ${successful.length} OG images successfully`);

        if (failed.length > 0) {
          console.warn(`Failed to generate ${failed.length} OG images:`);
          failed.forEach((f) => {
            console.warn(`  - ${f.file}: ${f.error}`);
          });
        }

        // Log successful generations
        successful.forEach((r) => {
          console.log(`Generated OG image: ${r.outputPath}`);
        });

        const duration = (Date.now() - startTime) / 1000;
        console.log(`OG image generation completed in ${duration.toFixed(2)}s`);
      } catch (error) {
        console.error('OG image generation failed:', error);
      }
    },
  };
};
