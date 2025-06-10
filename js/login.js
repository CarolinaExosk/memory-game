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
            event.preventDefault();

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

    const openRulesBtn = document.getElementById('open-rules-btn');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    const rulesOverlay = document.getElementById('rules-overlay');

    openRulesBtn.addEventListener('click', () => {
        rulesOverlay.classList.add('show');
    });


    closeRulesBtn.addEventListener('click', () => {
        rulesOverlay.classList.remove('show');
    });

    rulesOverlay.addEventListener('click', (event) => {
        if (event.target === rulesOverlay) {
            rulesOverlay.classList.remove('show');
        }
    });
});