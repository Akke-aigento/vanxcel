import { useEffect } from "react";

const BASE = "VanXcel";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Power Your Journey`;
    return () => { document.title = `${BASE} — Power Your Journey`; };
  }, [title]);
}
