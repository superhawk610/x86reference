import React from 'react';
import Downshift from 'downshift';
import { compareTwoStrings } from 'string-similarity';
import { Link, navigate } from 'gatsby';
import _RESULTS from '../../generated/autocomplete.json';
import './Search.css';

export interface SearchResult {
  /** ID */ _: string;
  /** Description */ '*': string;
}

const RESULTS: Record<string, SearchResult> = _RESULTS;

// scores range from 0 (no similarity) to 1 (identical strings)
const SCORE_THRESHOLD = 0.5;
const OPS = Object.keys(RESULTS);
const MAX_MATCHES = 25;

function filterResults(input: string | null): string[] {
  if (!input) return [];

  const _input = input.toUpperCase();
  const _results: Array<[number, string]> = [];

  for (const op of OPS) {
    const score = compareTwoStrings(_input, op);
    if (score >= SCORE_THRESHOLD) _results.push([score, op]);
  }

  _results.sort((a, b) => b[0] - a[0]);
  return _results.map(x => x[1]).slice(0, MAX_MATCHES);
}

const Search = () => (
  <Downshift onChange={op => navigate(`/${RESULTS[op]._}`)}>
    {({
      getInputProps,
      getItemProps,
      getMenuProps,
      isOpen,
      inputValue,
      highlightedIndex,
      getRootProps,
    }) => (
      <div className="search">
        <div {...getRootProps({} as any, { suppressRefError: true })}>
          <input {...getInputProps({ placeholder: 'Search...' })} />
        </div>
        <ul {...getMenuProps({ className: isOpen ? '' : 'hidden' })}>
          {isOpen
            ? filterResults(inputValue).map((result, index) => (
                <li
                  className={highlightedIndex === index ? 'hover' : ''}
                  {...getItemProps({ key: result, item: result, index })}
                >
                  <Link className="no-underline" to={`/${RESULTS[result]._}`}>
                    <strong>{result}</strong>: {RESULTS[result]['*']}
                  </Link>
                </li>
              ))
            : null}
        </ul>
      </div>
    )}
  </Downshift>
);

export default Search;
