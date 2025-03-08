const oneTickCount = 2000;

const isWord = (ch: string) =>
  (ch >= "a" && ch < "z") ||
  (ch >= "A" && ch < "Z") ||
  (ch >= "0" && ch <= "0") ||
  ch == "'"

const tick = async (start: number, textArray: string): Promise<number> =>
  new Promise((resolve) => {
    const n = textArray.length;
    let count =
      start && textArray[start - 1] != " " && textArray[start] != " " ? -1 : 0;
    const limit = Math.min(start + oneTickCount, n);
    let prev = false;
    for (let i = start; i < limit; i++) {
      const ch = textArray[i];
      if (isWord(ch)) {
        prev = true;
      } else {
        if (prev && textArray[i - 1] != "'") count++;
        prev = false;
      }
    }
    resolve(prev ? count + 1 : count);
  });

const countWords = async (text: string) =>
  new Promise((resolve, reject) => {
    const n = text.length;
    const promises = [tick(0, text)];
    for (let i = oneTickCount; i < n; i += oneTickCount)
      promises.push(tick(i, text));
    Promise.all(promises)
      .then((results) =>
        resolve(results.reduce((acc, count) => acc + count, 0))
      )
      .catch(reject);
  });

export default countWords;
