import { type JsMinifyOptions, minify as swcMinify, type TerserCompressOptions, type Output as SwcOutput, type JsFormatOptions, type TerserEcmaVersion } from '@swc/core';
import type { MinifierOptions, MinifierResult } from 'metro-transform-worker';

async function minifier(options: MinifierOptions): Promise<MinifierResult> {
  const result = await minify(options);

  if (!options.map || result.map == null) {
    return {code: result.code};
  }

  return { 
    code: result.code, 
    map: { 
      ...JSON.parse(result.map),
      sources: [options.filename] 
    } 
  };
}

async function minify({ code, map, reserved, config }: MinifierOptions): Promise<SwcOutput> {
  const { wrap_iife, ...output } = (config.output || {}) as  { wrap_iife: boolean | undefined };

  const swcOptions: JsMinifyOptions = {
    mangle: config.mangle === false ? false : {
      ...(config.mangle || {}),
      reserved: reserved as string[] || [],
    },
    format: {
      ...output,
      wrapIife: wrap_iife,
    },
    sourceMap: !!map && !!config.sourceMap,
    toplevel: config.toplevel as boolean | undefined,
    compress: config.compress as TerserCompressOptions,
    module: config.module as boolean | undefined || false,
    ecma: config.ecma as TerserEcmaVersion | undefined,
  };

  return await swcMinify(code, swcOptions);
}

export = minifier;