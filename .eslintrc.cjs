/*
* /.eslintrc.cjs
*
* This file steers IDEs, even when ESLint is not brought in as a dependency.
*
* References:
*   - Configuring ESLint
*     -> https://eslint.org/docs/user-guide/configuring
*/
const [off,warn,error] = ['off','warn','error'];

module.exports = {
  root: true,
  extends: [
    'eslint:recommended'
  ],

  env: {
    es6: true
  },

  parserOptions: {
    ecmaVersion: 2020,  // we might use: object spread (2018), dynamic import (2020)
    sourceType: 'module'
  },

  rules: {
    // eslint:recommended
    "no-unused-vars": [warn, {
      varsIgnorePattern: "^_",
      argsIgnorePattern: "^_",
    }]
  },

  // All variations are specified under 'overrides'
  overrides: [
    { // web component sources
      files: ["package/**/*.js"],
      env: {
        browser: true,
        es6: true
      }
    },

    {   // general non-browser JS ('vite.config.js' etc.); not Node sources
      files: ["*.js"],
      globals: {
        process: true,
      }
    },

    // cjs build files (including this one)
    {
      files: ["*.cjs"],    // .eslintrc.cjs
      env: {
        es6: true
      },
      globals: {
        module: true
      }
    }
  ]
};
