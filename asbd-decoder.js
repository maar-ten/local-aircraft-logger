function hexToBin(hex) {
  return hex.split('')
    .map(c => parseInt(c, 16).toString(2).padStart(4, '0'))
    .join('');
}

function binToInt(bin) {
  return parseInt(bin, 2);
}

export function decodeAdsbMessage(hex) {
  const bin = hexToBin(hex);
  if (bin.length !== 112) {
    throw new Error("Message must be 112 bits (extended squitter)");
  }

  const df = binToInt(bin.slice(0, 5));
  const ca = binToInt(bin.slice(5, 8));
  const icao = parseInt(bin.slice(8, 32), 2).toString(16).toUpperCase().padStart(6, '0');
  const typeCode = binToInt(bin.slice(32, 37));

  if (typeCode >= 9 && typeCode <= 18) {
    const altitudeBits = bin.slice(40, 52);
    const qBit = altitudeBits[4];

    let altitude;
    if (qBit === '1') {
      const n = parseInt(altitudeBits.slice(0, 4) + altitudeBits.slice(5), 2);
      altitude = n * 25 - 1000;
    } else {
      altitude = null; // nondecodable altitude
    }

    const cprFormat = parseInt(bin[53]); // 0 = even, 1 = oneven
    const cprLat = binToInt(bin.slice(54, 71));
    const cprLon = binToInt(bin.slice(71, 88));

    return {
      df, ca, icao, typeCode,
      altitude,
      cprFormat,
      cprLat,
      cprLon
    };
  } else {
    return {
      df, ca, icao, typeCode,
      info: 'Cannot decode position'
    };
  }
}
