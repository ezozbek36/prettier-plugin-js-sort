const {
	parsers: { typescript: prettierTypescriptParser },
} = require('prettier/parser-typescript')
const {
	parsers: { babel: prettierBabelParser },
} = require('prettier/parser-babel')
const { expressionStatement, stringLiteral } = require('@babel/types')
const { default: generator } = require('@babel/generator')
const { default: traverse } = require('@babel/traverse')
const babelParser = require('@babel/parser')
const { readFileSync } = require('fs')

const PRETTIER_PLUGIN_JS_SORT_NEW_LINE = 'PRETTIER_PLUGIN_JS_SORT_NEW_LINE'

const newLineNode = expressionStatement(stringLiteral(PRETTIER_PLUGIN_JS_SORT_NEW_LINE))

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
 * @param {import('@babel/types').ImportDeclaration} a
 * @param {import('@babel/types').ImportDeclaration} b
 * @returns
 */

const sortImportDeclarationCB = (a, b) => {
	let a1 = a.end - a.start
	let b1 = b.end - b.start

	return b1 - a1
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

	return b1 - a1
}

/**
 * @type {import('prettier').CustomParser}
 * @returns
 */
const parser = (text, parsers, options) => {
	const isTs = /.ts?x$/.test(options?.filepath)

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
		Program: path => {
			const imports = path.node.body.filter(f => f.type === 'ImportDeclaration')

			const namedImports = imports.filter(f => f.specifiers?.length !== 0)
			const includedImports = imports.filter(f => f.specifiers?.length === 0)

			const namedModuleImports = namedImports.filter(f => !f.source.value.startsWith('.')).sort(sortImportSpecifiersCB)
			const namedFileImports = namedImports.filter(f => f.source.value.startsWith('.')).sort(sortImportSpecifiersCB)

			const includedModuledImports = includedImports.filter(f => !f.source.value.startsWith('.')).sort(sortImportSpecifiersCB)
			const includedFileImports = includedImports.filter(f => f.source.value.startsWith('.')).sort(sortImportSpecifiersCB)

			const sortedImports = [...namedModuleImports, newLineNode, ...namedFileImports, newLineNode, ...includedModuledImports, newLineNode, ...includedFileImports]

			path.node.body = path.node.body.filter(f => f.type !== 'ImportDeclaration')

			path.node.body = sortedImports
		},
	})

	return ast
}

const preprocess = code => {
	return code.replace(new RegExp(`"${PRETTIER_PLUGIN_JS_SORT_NEW_LINE}";`, 'gi'), '')
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
			parse: parser,
			...prettierBabelParser,
			preprocess,
		},
		typescript: {
			...prettierTypescriptParser,
			parse: parser,
			preprocess,
		},
	},
}

module.exports = plugin
