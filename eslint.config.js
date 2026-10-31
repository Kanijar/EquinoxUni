// ESLint-asetukset. Säännöt pitävät tiedostot pieninä ja kerrosrajat selkeinä,
// jotta tekoäly (ja ihminen) pystyy muokkaamaan koodia turvallisesti.
// ÄLÄ löysennä rajoja: jaa mieluummin tiedosto pienempiin osiin.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const noPhaser = {
  name: 'phaser',
  message: 'logic/, data/ ja net/ ovat puhdasta TypeScriptiä ilman Phaseria (testattavuus).',
};

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      // --- Tiedostojen ja funktioiden koko ---
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 12],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'max-nested-callbacks': ['error', 3],
      // --- Luettavuus ---
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: 'error',
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Puhdas pelilogiikka, sisältödata ja verkkoyhteydet: ei Phaseria.
    files: ['src/logic/**/*.ts', 'src/data/**/*.ts', 'src/net/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { paths: [noPhaser] }],
    },
  },
  {
    // Data ei saa riippua pelin toteutuksesta, vain tyypeistä.
    files: ['src/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [noPhaser],
          patterns: [
            {
              group: ['../scenes/*', '../entities/*', '../systems/*', '../ui/*'],
              message: 'data/ saa tuoda vain tyyppejä (data/types.ts).',
            },
          ],
        },
      ],
      // Sisältölistat saavat olla hieman pidempiä, mutta jaa ne silti ajoissa.
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: { 'max-lines-per-function': 'off', 'max-nested-callbacks': 'off' },
  },
  {
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },
);
