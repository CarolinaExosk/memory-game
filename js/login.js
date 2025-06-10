document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('.login-form');
    const input = document.querySelector('.login__input');
    const playButton = document.querySelector('.login__btn');
    const dropdownButtons = document.querySelectorAll('.dropdown__btn');

    const selections = {
        mode: null,
        difficulty: null
    };
    const validateForm = () => {
        const nameIsValid = input.value.length > 2;
        const modeIsSelected = selections.mode !== null;
        const difficultyIsSelected = selections.difficulty !== null;

        if (nameIsValid && modeIsSelected && difficultyIsSelected) {
            playButton.removeAttribute('disabled');
        } else {
            playButton.setAttribute('disabled', '');
        }
    };

    input.addEventListener('input', validateForm);

    dropdownButtons.forEach(button => {
        button.addEventListener('click', () => {

            document.querySelectorAll('.dropdown__content').forEach(content => {
                if (content !== button.nextElementSibling) {
                    content.classList.remove('show');
                }
            });
            const content = button.nextElementSibling;
            content.classList.toggle('show');
        });
    });

    const dropdownOptions = document.querySelectorAll('.dropdown__content a');
    dropdownOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            event.preventDefault(); // Impede que o link recarregue a página

            const button = option.parentElement.previousElementSibling;
            const content = option.parentElement;
            const selectionType = button.dataset.selectionType;
            const value = option.dataset.value;

            button.textContent = `${selectionType}: ${option.textContent}`;

            if (selectionType === 'Modo') {
                selections.mode = value;
            } else if (selectionType === 'Dificuldade') {
                selections.difficulty = value;
            }
            content.classList.remove('show');

            validateForm();
        });
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        localStorage.setItem('player', input.value);
        localStorage.setItem('gameMode', selections.mode);
        localStorage.setItem('gameDifficulty', selections.difficulty);

        window.location = 'pages/jogo.html';
    };

    form.addEventListener('submit', handleSubmit);

    window.addEventListener('click', (event) => {
        if (!event.target.matches('.dropdown__btn')) {
            document.querySelectorAll('.dropdown__content').forEach(content => {
                content.classList.remove('show');
            });
        }
    });

    // Seleciona os elementos do DOM
    const openRulesBtn = document.getElementById('open-rules-btn');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    const rulesOverlay = document.getElementById('rules-overlay');

// Função para abrir o pergaminho
    openRulesBtn.addEventListener('click', () => {
        rulesOverlay.classList.add('show');
    });

// Função para fechar o pergaminho com o botão 'X'
    closeRulesBtn.addEventListener('click', () => {
        rulesOverlay.classList.remove('show');
    });

// Função para fechar o pergaminho clicando fora dele (no overlay)
    rulesOverlay.addEventListener('click', (event) => {
        // Verifica se o clique foi no próprio overlay e não nos seus filhos (o pergaminho)
        if (event.target === rulesOverlay) {
            rulesOverlay.classList.remove('show');
        }
    });
});