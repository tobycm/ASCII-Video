import asciify from "asciify-image";
import ffmpeg from "fluent-ffmpeg";
import { Writable } from "stream";

export function create(input: string, output: Writable, options: { fps?: number; width?: number }) {
  const locks: number[] = [];

  const frames = new Writable({
    write(chunk, encoding, callback) {
      locks.push(locks.length++);

      console.log("Processing frame", locks.length);

      asciify(chunk, { width: options.width ?? 160 }, (err, asciified) => {
        if (!err) output.write(asciified, callback);

        locks.pop();
      });

      callback();
    },

    final(callback) {
      if (locks.length) return setImmediate(() => this._final(callback));

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
