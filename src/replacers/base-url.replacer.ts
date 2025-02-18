/**
 * @file
 *
 * The baseUrl replacer replaces the import statement
 * with the baseUrl + import statement location.
 */

/** */
import normalizePath = require('normalize-path');
import { dirname, relative } from 'path';
import { AliasReplacerArguments } from '../interfaces';
import { newStringRegex } from '../utils';

export default function replaceBaseUrlImport({
  orig,
  file,
  config
}: AliasReplacerArguments): string {
  const requiredModule = orig.match(newStringRegex())?.groups?.path;
  config.output.debug('base-url replacer - requiredModule: ', requiredModule);
  config.output.assert(
    typeof requiredModule == 'string',
    `Unexpected import statement pattern ${orig}`
  );

  // Check if import is already resolved.
  if (requiredModule.startsWith('.')) {
    config.output.debug('base-url replacer - already resolved');
    return orig;
  }

  // If there are files matching the target, resolve the path.
  if (
    config.pathCache.existsResolvedAlias(
      `${config.outPath}/${requiredModule}`
    ) ||
    config.pathCache.existsResolvedAlias(
      `${config.outPath}/${requiredModule.replace('src/', '')}`
    )
  ) {
    let relativePath: string = normalizePath(
      relative(
        dirname(file),
        config.pathCache
          .getAbsoluteAliasPath(config.outPath, '')
          .replace('---', '')
      )
    );
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    config.output.debug('base-url replacer - relativePath: ', relativePath);

    const index = orig.indexOf(requiredModule);
    const newImportScript =
      orig.substring(0, index) +
      relativePath +
      '/' +
      orig.replace('src/', '').substring(index);
    config.output.debug(
      'base-url replacer - newImportScript: ',
      newImportScript
    );

    const modulePath = newImportScript.match(newStringRegex()).groups.path;
    config.output.debug('base-url replacer - modulePath: ', modulePath);
    return newImportScript.replace(modulePath, normalizePath(modulePath));
  }
  return orig;
}
