import { useCallback, useState, useEffect } from "react";

const getSearch = (url = window.location) => {
  const params = {};
  for (const [name, value] of new URL(url).searchParams.entries()) {
    params[name] = value;
  }
  return params;
};

const useSearch = () => {
  const [params, setParams] = useState(getSearch());
  const onHashChange = useCallback(() => {
    setParams(getSearch());
  }, []);
  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [onHashChange]);
  return params;
};

export { getSearch, useSearch };
