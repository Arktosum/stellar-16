import { createElement } from "./util";

export function bitButton(description: string, callback = () => { }) {
    const container = createElement('div', 'bit-container');
    const bitButton = createElement('div', 'bit-button');
    const bitDescription = createElement('div', 'bit-description', "", description);
    container.state = false;
    bitButton.classList.add('bit-off');
    container.appendChild(bitButton);
    container.appendChild(bitDescription);
    container.addEventListener('click', () => {
        container.state = !container.state;
        bitButton.classList.remove(container.state ? 'bit-off' : 'bit-on');
        bitButton.classList.add(!container.state ? 'bit-off' : 'bit-on');
        callback();
    })
    return container;
}



export function bitDisplay(description: string) {
    const container = createElement('div', 'bit-container');
    const bitButton = createElement('div', 'bit-button');
    const bitDescription = createElement('div', 'bit-description', "", description);
    bitButton.classList.add('bit-off');
    container.appendChild(bitButton);
    container.appendChild(bitDescription);
    container.display = (state: boolean) => {
        bitButton.classList.remove(state ? 'bit-off' : 'bit-on');
        bitButton.classList.add(!state ? 'bit-off' : 'bit-on');
    }
    return container;
}
