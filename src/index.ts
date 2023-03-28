import { createUnplugin } from 'unplugin'
import { resolveOptions } from './core/options'
import { generateComponentFromPath, isIconPath, normalizeIconPath, resolveIconsPath } from './core/loader'
import type { Options } from './types'

const unplugin = createUnplugin<Options | undefined>((options = {}) => {
  const resolved = resolveOptions(options)

  return {
    name: 'unplugin-icons',
    enforce: 'pre',
    resolveId(id) {
      if (isIconPath(id)) {
        const res = normalizeIconPath(id)
          .replace(/\.\w+$/i, '')
          .replace(/^\//, '')
        const resolved = resolveIconsPath(res)
        // accept raw compiler from query params
        const compiler = resolved?.query?.raw === 'true' ? 'raw' : options.compiler
        if (compiler && typeof compiler !== 'string') {
          const ext = compiler.extension
          if (ext)
            return `${res}.${ext.startsWith('.') ? ext.slice(1) : ext}`
        }
        else {
          switch (compiler) {
            case 'astro':
              return `${res}.astro`
            case 'jsx':
              return `${res}.jsx`
            case 'qwik':
              return `${res}.tsx`
            case 'marko':
              return `${res}.marko`
            case 'svelte':
              return `${res}.svelte`
            case 'solid':
              return `${res}.tsx`
          }
        }
        return res
      }
      return null
    },
    loadInclude(id) {
      return isIconPath(id)
    },
    async load(id) {
      const config = await resolved
      const code = await generateComponentFromPath(id, config) || null
      if (code)
        return { code }
    },
    rollup: {
      api: {
        config: options,
      },
    },
  }
})

export * from './types'

export default unplugin
