const playerName = localStorage.getItem('Exosk') || 'Convidado';
document.getElementById('playerName').textContent = playerName;

const grid = document.querySelector('.grid');

const cards = [
    /*nome das imagens das cartas fzr dps*/
]

const createElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

const createCard = () => {
    const card = createElement('div', 'card');
    const front = createElement('div', 'face front');
    const back = createElement('div', 'face back');

    card.appendChild(front);
    card.appendChild(back);

    grid.appendChild(card);

    return card;

}
createCard();