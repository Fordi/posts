import { useEffect, useState } from "react";

let PACKAGE = null;

export default function usePackage() {
  const [pkg, setPkg] = useState(PACKAGE);
  useEffect(() => {
    (async () => {
      if (!PACKAGE) {
        PACKAGE = await window.API.getPackage();
        setPkg(PACKAGE);
      }
    })();
  }, []);
  return pkg;
}
