const { default: traverse } = require('@babel/traverse')

/**
 *
 * @param {import('@babel/types').JSXAttribute|import('@babel/types').JSXSpreadAttribute} a
 * @param {import('@babel/types').JSXAttribute|import('@babel/types').JSXSpreadAttribute} b
 * @returns
 */

const sort = (a, b) => {
	let a1 = a.end - a.start
	let b1 = b.end - b.start

	if (a1 === b1) {
		a1 = a.name.end - a.name.start
		b1 = b.name.end - b.name.start
	}

	return a1 - b1
}

/**
 * @type {import('prettier').Config}
 */
const config = {
	semi: false,
	tabWidth: 3,
	useTabs: true,
	printWidth: 220,
	singleQuote: true,
	arrowParens: 'avoid',
	jsxSingleQuote: true,
	plugins: [
		require.resolve('.'),
	],
}

module.exports = config
