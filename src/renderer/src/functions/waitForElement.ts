/**
 * Espera um elemento aparecer no DOM usando MutationObserver.
 * @param selector O seletor CSS do elemento a ser esperado.
 * @param timeout O tempo máximo de espera em milissegundos.
 * @returns Uma Promise que resolve com o elemento quando ele é encontrado.
 */
export function waitForElement(selector: string, timeout = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    // Tenta encontrar o elemento imediatamente, caso ele já exista
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect(); // Para de observar assim que encontra
        resolve(element);
      }
    });

    // Começa a observar o corpo do documento por adições de filhos na árvore
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Tempo esgotado esperando pelo seletor: ${selector}`));
    }, timeout);
  });
}
