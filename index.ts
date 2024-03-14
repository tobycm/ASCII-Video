import asciify from "asciify-image";
import ffmpeg from "fluent-ffmpeg";
import { Writable } from "stream";

export function create(input: string, options: { fps?: number; width?: number }) {
  return new Promise<(string | string[])[]>((resolve, reject) => {
    const frames: any[] = [];

    const locks: number[] = [];

    const output = new Writable({
      write(chunk, encoding, callback) {
        locks.push(locks.length++);

        console.log("Processing frame", locks.length);

        asciify(chunk, { width: options.width ?? 160 }, (err, asciified) => {
          frames.push(asciified);

          locks.pop();
        });

        callback();
      },

      final(callback) {
        if (locks.length) return setImmediate(() => this._final(callback));

        resolve(frames);

        callback();
      },
    });

    ffmpeg(input)
      .inputFPS(options.fps ?? 15)
      .noAudio()

      .outputFormat("image2pipe")

      .on("end", output.end)
      .on("error", console.error)

      .pipe(output);
  });
}

export default {
  create,
};
