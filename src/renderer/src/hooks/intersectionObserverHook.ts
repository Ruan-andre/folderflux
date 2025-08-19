import { useEffect, RefObject } from "react";

interface ObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Um custom hook que utiliza a Intersection Observer API para chamar um callback
 * quando um elemento de referência se torna visível na tela.
 * @param elementRef A referência (useRef) para o elemento a ser observado.
 * @param callback A função a ser executada quando o elemento se torna visível.
 * @param options Opções de configuração para o IntersectionObserver.
 */
export const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  callback: () => void,
  options?: ObserverOptions
) => {
  useEffect(() => {
    const element = elementRef.current;

    if (!element || !callback) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          callback();
        }
      },
      { ...options }
    );
    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, callback, options]);
};
