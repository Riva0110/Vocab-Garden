import { RefObject, useEffect } from "react";

function useOnClickOutside(
  ref: RefObject<HTMLDivElement>,
  // eslint-disable-next-line no-unused-vars
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current) return;
      if (!(event.target instanceof Node)) return;
      if (ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export { useOnClickOutside };
