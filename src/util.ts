export function createElement(elementType: string, className: string = "", id: string = "", text: string = "") {
    const element = document.createElement(elementType);
    element.className = className;
    element.id = id;
    element.innerText = text;
    element.textContent = text;
    return element;
}