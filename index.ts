import asciifyImage from "asciify-image";
import { $ } from "bun";
import fs from "fs";

const TEMP_DIR = "/tmp/videoToAscii/";

export async function create(input: Buffer, id: string, tempDir: string = TEMP_DIR, fps: number = 15) {
  // create temp directory if it doesn't exist
  if (!fs.existsSync(`${tempDir}/${id}/`)) fs.mkdirSync(`${tempDir}/${id}/`, { recursive: true });

  const ffmpegCall = $`ffmpeg -i pipe:0 -vf fps=1/${fps} %d.png`;

  ffmpegCall.stdin.getWriter().write(input);

  const ffmpegResult = await ffmpegCall;

  if (ffmpegResult.exitCode !== 0) return ffmpegResult.stderr;

  const files = fs.readdirSync(`${tempDir}/${id}/`).map((file) => `${tempDir}/${id}/${file}`);

  const frames = [];

  for (const file of files) frames.push(await asciifyImage(file));

  return frames;
}

export default {
  create,
};
