import * as os from "node:os";
import { Transform } from "node:stream";

const OPENING_STRING = "[";
const SEPARATOR_STRING = ",\n";
const CLOSING_STRING = "]" + os.EOL;

export default class JSONTransform extends Transform {
  constructor() {
    super({ writableObjectMode: true });
    this.firstChunk = true;
    this.hasTransformedData = false;
  }

  _transform(chunk, encoding, callback) {
    this.hasTransformedData = true;
    try {
      const json = JSON.stringify(chunk, null, null);
      if (this.firstChunk) {
        this.firstChunk = false;
        this.push(OPENING_STRING + json);
      } else {
        this.push(SEPARATOR_STRING + json);
      }
      callback();
    } catch (error) {
      return this.emit("error", error);
    }
  }

  _flush() {
    if (!this.hasTransformedData) {
      this.push(OPENING_STRING);
    }
    this.push(CLOSING_STRING);
    this.push(null);
  }
}
