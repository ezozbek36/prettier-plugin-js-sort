const {
	parsers: { typescript: prettierTypescriptParser },
} = require('prettier/parser-typescript')
const {
	parsers: { babel: prettierBabelParser },
} = require('prettier/parser-babel')
const { default: traverse } = require('@babel/traverse')
const babelParser = require('@babel/parser')

/**
 *
 * @param {import('@babel/types').JSXAttribute|import('@babel/types').JSXSpreadAttribute} a
 * @param {import('@babel/types').JSXAttribute|import('@babel/types').JSXSpreadAttribute} b
 * @returns
 */

const sortAttributesCB = (a, b) => {
	let a1 = a.end - a.start
	let b1 = b.end - b.start

	if (a1 === b1) {
		a1 = a.name?.end - a.name?.start
		b1 = b.name?.end - b.name?.start
	}

	return a1 - b1
}

/**
 *
 * @param {import('@babel/types').ExportSpecifier} a
 * @param {import('@babel/types').ExportSpecifier} b
 * @returns
 */

const sortExportSpecifiersCB = (a, b) => {
	let a1 = a.end - a.start
	let b1 = b.end - b.start

	return a1 - b1
}

/**
 *
 * @param {import('@babel/types').ImportSpecifier} a
 * @param {import('@babel/types').ImportSpecifier} b
 * @returns
 */

const sortImportSpecifiersCB = (a, b) => {
	let a1 = a.end - a.start
	let b1 = b.end - b.start

	return a1 - b1
}

/**
 * @type {import('prettier').CustomParser}
 * @returns
 */
const parser = (text, parsers, options) => {
	const isTs = /.ts?x$/.test(options.filepath)

	let ast = babelParser.parse(text, {
		sourceType: 'module',
		plugins: ['jsx', 'typescript'],
	})

	traverse(ast, {
		JSXOpeningElement: path => {
			path.node.attributes = path.node.attributes.sort(sortAttributesCB)
		},
		ExportDeclaration: path => {
			if (Array.isArray(path.node.specifiers)) {
				path.node.specifiers = path.node.specifiers.sort(sortExportSpecifiersCB)
			}
		},
		ImportDeclaration: path => {
			if (Array.isArray(path.node.specifiers)) {
				path.node.specifiers = path.node.specifiers.sort(sortImportSpecifiersCB)
			}
		},
	})

	return ast
}
/**
 * @type {import('prettier').Plugin}
 */
const plugin = {
	languages: [
		{
			name: 'Babel',
			parsers: ['babel'],
			extensions: ['.js', '.jsx'],
		},
	],
	parsers: {
		babel: {
			...prettierBabelParser,
			parse: parser,
		},
		typescript: {
			...prettierTypescriptParser,
			parse: parser,
		},
	},
}

module.exports = plugin
