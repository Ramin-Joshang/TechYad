const d = { description: 'test' };
const x = {
  description: 'fallback',
  ...d,
  mode: 'online'
};
console.log(x);
