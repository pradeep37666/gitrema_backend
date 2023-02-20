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
