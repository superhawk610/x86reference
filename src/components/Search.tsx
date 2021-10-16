import React, { useState, useEffect } from 'react';
import { compareTwoStrings } from 'string-similarity';
import RESULTS from '../../autocomplete.json';

// scores range from 0 (no similarity) to 1 (identical strings)
const SCORE_THRESHOLD = 0.5;
const OPS = Object.keys(RESULTS);
const MAX_MATCHES = 25;

const Search = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<string[]>([]);

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
    <div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <ul>
        {results.map(result => (
          <li key={result}>
            <strong>{result}</strong>: {RESULTS[result]['*']}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
