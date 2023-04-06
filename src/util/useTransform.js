import { useEffect, useState } from "react";

export default function useTransform (transformer, deps) {
  const [state, setState] = useState(() => transformer(null));
  useEffect(() => {
    setState((previous) => transformer(previous));
    // eslint-disable-next-line
  }, deps);
  return state;
};

