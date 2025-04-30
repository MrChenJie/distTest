/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * 获得字符串字节数 UTF-8
 *
 * @export
 * @param {string} s
 * @returns {number}
 */
export function getStringBytes(s) {
  if (typeof s !== 'string') {
    return 0;
  }
  let num = 0;
  for (const c of s) {
    const codePoint = c.codePointAt(0);
    num += codePoint < 0x0080 ? 1 : codePoint < 0x0800 ? 2 : codePoint < 0x10000 ? 3 : 4;
  }
  return num;
}

/**
 * 截取最大字节数字符串
 *
 * @export
 * @param {string} s --原字符串
 * @param {number} maxBytes --最大字节数
 * @returns {number} --newString
 */
export function interceptString(s, maxBytes) {
  if (
    typeof s !== 'string' ||
    typeof maxBytes !== 'number' ||
    Number.isNaN(maxBytes) ||
    maxBytes <= 0
  ) {
    return '';
  }
  const newS = s.substr(0, maxBytes);
  if (getStringBytes(newS) <= maxBytes) {
    return newS;
  } else {
    let from = 0;
    let to = newS.length;
    while (true) {
      const mid = Math.floor((from + to) / 2);
      const s1 = newS.substr(0, mid);
      const s2 = newS.substr(0, mid + 1);
      const b1 = getStringBytes(s1);
      const b2 = getStringBytes(s2);
      if (b1 === maxBytes || (b1 < maxBytes && b2 > maxBytes)) {
        return s1;
      } else if (b1 < maxBytes) {
        from = mid;
      } else {
        to = mid;
      }
    }
  }
}
