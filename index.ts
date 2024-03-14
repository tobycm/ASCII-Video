import asciify from "asciify-image";
import ffmpeg from "fluent-ffmpeg";
import { Writable } from "stream";

export function create(input: string, output: Writable, options: { fps?: number; width?: number }) {
  const frames = new Writable({
    async write(chunk, encoding, callback) {
      try {
        const ascii = await asciify(chunk, { fit: "box", width: options.width ?? 50 });
        output.write(ascii, callback);
      } catch {
        callback();
      }
    },

    final(callback) {
      output.end();

      callback();
    },
  });

  ffmpeg(input)
    .inputFPS(options.fps ?? 15)
    .noAudio()

    .outputFormat("image2pipe")

    .on("end", frames.end)
    .on("error", console.error)

    .pipe(frames);
}

export default {
  create,
};
