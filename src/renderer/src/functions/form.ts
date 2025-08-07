let originalColor: string | null = "";
let tempElement: HTMLElement | undefined;

export const formHelper = {
  htmlInputFocus: (inputId: string, borderColor?: string) => {
    const element = document.getElementById(inputId) as HTMLInputElement;
    if (element) element.focus();
    const nextSibling = element.nextElementSibling as HTMLElement;
    nextSibling.id = crypto.randomUUID();
    tempElement = nextSibling;
    if (borderColor) formHelper.htmlElementBorderChange(tempElement?.id, borderColor);
  },
  htmlElementBorderChange: (id: string, color: string = "red") => {
    const element = document.getElementById(id!) as HTMLElement;
    if (element) {
      originalColor = element.style.borderColor;
      element.style.borderColor = color;

      if (tempElement) tempElement.parentElement?.addEventListener("mouseenter", restoreBorderColor);
      else element.addEventListener("mouseenter", restoreBorderColor);
    }
  },
};

const restoreBorderColor = (event: MouseEvent) => {
  if (tempElement) {
    tempElement.style.borderColor = originalColor ?? "";
    tempElement.removeEventListener("mouseenter", restoreBorderColor);
    tempElement = undefined;
    originalColor = null;
  } else {
    const element = event.currentTarget as HTMLElement;
    element.style.borderColor = originalColor ?? "";
    element.removeEventListener("mouseenter", restoreBorderColor);
  }
};
