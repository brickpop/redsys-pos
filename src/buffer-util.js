exports.toBuffer = function(payload, blockSize = 8) {
  if (typeof payload === "string" || payload.constructor !== Buffer) {
    payload = new Buffer(payload, "utf8");
  }
  var align = new Buffer(
    (blockSize - (payload.length % blockSize)) % blockSize
  ).fill(0);
  return Buffer.concat([payload, align]);
};

exports.toString = function(buffer, blockSize = 8) {
  var idx = buffer.length;
  const minStart = idx - blockSize;
  while (idx >= 0 && idx >= minStart) {
    idx--;
    if (buffer[idx] !== 0) {
      break;
    }
  }
  return buffer.slice(0, idx + 1).toString("utf8");
};
