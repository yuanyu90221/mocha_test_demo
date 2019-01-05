# Mocha Test DEMO

## This is a document for mocha test

## <b>assert</b> system is use <b><red>chai</red></b>

## <b>cross-env</b> for differenet mode

## test script for env-cross
`
"scripts": {
    "test": "./node_modules/.bin/cross-env NODE_ENV=development ./node_modules/.bin/mocha ./test/**/*.test.js"
  },
`

## run test case 
`npm run mocha ${full_path_of_testfile}`