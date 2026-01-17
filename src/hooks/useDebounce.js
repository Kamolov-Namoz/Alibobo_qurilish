import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook for debouncing input values to prevent excessive updates
 * 
 * @param {any} initialValue - The initial value
 * @param {number} delay - The delay in milliseconds
 * @param {Function} onChange - Optional callback when value changes
 * @returns {Array} - [debouncedValue, setValue, immediateValue, cancelDebounce]
 */
export function useDebounce(initialValue, delay = 500, onChange = null) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timerRef = useRef(null);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Set up debounce timer when value changes
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set up new timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      if (onChange) {
        onChange(value);
      }
    }, delay);
    
    // Clean up function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay, onChange]);

  // Cancel debounce and update immediately
  const cancelDebounce = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDebouncedValue(value);
    if (onChange) {
      onChange(value);
    }
  }, [value, onChange]);

  return [debouncedValue, setValue, value, cancelDebounce];
}

/**
 * A hook for debouncing search queries
 * 
 * @param {string} initialQuery - Initial search query
 * @param {number} delay - Delay in milliseconds
 * @param {Function} onSearch - Callback when search query is debounced
 * @returns {Array} - [query, setQuery, debouncedQuery, isDebouncing]
 */
export function useDebouncedSearch(initialQuery = '', delay = 500, onSearch = null) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timerRef = useRef(null);

  // Handle query changes
  useEffect(() => {
    // Mark as debouncing
    if (query !== debouncedQuery) {
      setIsDebouncing(true);
    }
    
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set new timer
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsDebouncing(false);
      if (onSearch) {
        onSearch(query);
      }
    }, delay);
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, delay, onSearch, debouncedQuery]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return [query, setQuery, debouncedQuery, isDebouncing];
}
