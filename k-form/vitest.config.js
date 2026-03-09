/** @type {import('vitest').UserConfig} */
export default {
  testEnvironment: 'jsdom',
  setupFiles: ['./vitest.setup.js'],
  include: ['**/*.test.js', '**/*.test.jsx']
};
