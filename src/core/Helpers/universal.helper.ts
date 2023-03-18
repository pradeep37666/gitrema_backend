import * as path from 'path';
import * as fs from 'fs';

export const generateRandomPassword = function () {
  return Math.random().toString(36).slice(-8);
};

export const capitalize = function (word: string) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
};

export const getHBVars = (text) => {
  const re = /[^{\{]+(?=}\})/g;
  const tags = [];
  let matches;
  while (Boolean((matches = re.exec(text)))) {
    console.log(matches);
    if (matches) {
      tags.push(matches[0]);
    }
  }
  return tags;
};

export const roundOffNumber = (value: number, precision = 2): number => {
  return parseFloat(value?.toFixed(precision));
};

export async function* getFiles(rootPath) {
  const fileNames = await fs.promises.readdir(rootPath);
  for (const fileName of fileNames) {
    const filePath = path.resolve(rootPath, fileName);
    if ((await fs.promises.stat(filePath)).isDirectory()) {
      yield* getFiles(filePath);
    } else {
      yield filePath;
    }
  }
}

export async function reduce(asyncIter, f, init) {
  let res = init;
  for await (const x of asyncIter) {
    res = f(res, x);
  }
  return res;
}

/**
 * Replaces all occurrences of words in a sentence with new words.
 * @function
 * @param {string} sentence - The sentence to modify.
 * @param {Object} wordsToReplace - An object containing words to be replaced as the keys and their replacements as the values.
 * @returns {string} - The modified sentence.
 */
export const replaceAll = (sentence, wordsToReplace) => {
  return Object.keys(wordsToReplace).reduce(
    (f, s, i) => `az${f}`.replace(new RegExp(s, 'ig'), wordsToReplace[s]),
    sentence,
  );
};
