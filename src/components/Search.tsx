import React, { useState, useEffect } from 'react';
import { compareTwoStrings } from 'string-similarity';
import { Link } from 'gatsby';
import _RESULTS from '../../autocomplete.json';
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

// TODO: keyboard controls
const Search = () => {
  // TODO: restore search input when switching pages
  const [input, setInput] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const blur = () => (document.activeElement as HTMLElement | null)?.blur();

  useEffect(() => {
    if (!input) {
      setResults([]);
      return;
    }

    const _input = input.toUpperCase();
    const _results: Array<[number, string]> = [];

    for (const op of OPS) {
      const score = compareTwoStrings(_input, op);
      if (score >= SCORE_THRESHOLD) _results.push([score, op]);
    }

    _results.sort((a, b) => b[0] - a[0]);
    setResults(_results.map(x => x[1]).slice(0, MAX_MATCHES));
  }, [input]);

  return (
    <div className="search">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <ul className={results.length === 0 ? 'hidden' : ''}>
        {results.map(result => (
          <li key={result}>
            <Link
              className="no-underline"
              to={`/${RESULTS[result]._}`}
              onClick={blur}
            >
              <strong>{result}</strong>: {RESULTS[result]['*']}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
