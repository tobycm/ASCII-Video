import asciify from "asciify-image";
import ffmpeg from "fluent-ffmpeg";
import { Writable } from "stream";

export function create(input: string, output: Writable, options: { fps?: number; width?: number }) {
  const frames = new Writable({
    write(chunk, encoding, callback) {
      asciify(chunk, { fit: "box", width: options.width ?? 50 }, (err, ascii) => {
        if (err) return;

        output.write(ascii);
      });

      callback();
    },

    final(callback) {
      output.end();

      callback();
    },
  });

  ffmpeg(input)
    .inputFPS(options.fps ?? 15)
    .noAudio()
    .inputOptions("-readrate", "1")

    .outputFormat("image2pipe")
    .videoCodec("png")
    .outputFps(options.fps ?? 15)

    .on("end", frames.end)
    // .on("error", console.error)

    .pipe(frames);
}

export default {
  create,
};
