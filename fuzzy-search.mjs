import Fuse from 'fuse.js'

const FUSE_OPTIONS = {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    threshold: 0.5,
  };
  
  /**
   * Uses a fuzzy search algorithm ([with Fuse.js](https://fusejs.io/)) to filter
   * a list based on a search pattern.
   *
   * This function is curried.
   *
   * @type {<T>(list: Array<T>, keys: Array<keyof T>) =>
   *   (pattern: string) =>
   *   Array<{
   *     item: T,
   *     refIndex: number,
   *     score: number,
   *   }>}
   */
  export const fuzzySearch = (list, keys = []) => {
    const fuse = new Fuse(list, { ...FUSE_OPTIONS, keys });
    return pattern => fuse.search(pattern);
  };