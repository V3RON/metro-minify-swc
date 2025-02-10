import { minify as swcMinify } from '@swc/core';
import type { MinifierOptions, MinifierResult } from 'metro-transform-worker';

async function minify({
  code,
  reserved,
  config,
}: MinifierOptions): Promise<MinifierResult> {
  try {
    const result = await swcMinify(code, {
      ...config,
      mangle: {
        toplevel: false,
        ...(config.mangle ?? {}),
        reserved: reserved as string[],
      },
      compress: {
        reduce_funcs: false,
        ...(config.compress ?? {}),
      },
      format: {
        asciiOnly: true,
        wrapIife: true,
        ...(config.format ?? {}),
      },
      sourceMap: true,
    });

    return {
      code: result.code,
      map: result.map ? JSON.parse(result.map) : undefined,
    };
  } catch (error) {
    throw new Error(
      'Failed to minify code with SWC. This might be due to invalid configuration. ' +
      'Please ensure you pass correct minifierConfig in your Metro configuration. ', {
        cause: error,
      },
    );
  }
}

export = minify;