document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.login__input');
    const button = document.querySelector('.login__btn');
    const form = document.querySelector('.login-form');

    const validateInput = ({ target }) => {
        if (target.value.length > 2) {
            button.removeAttribute('disabled');
            return;
        }
        button.setAttribute('disabled', '');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        localStorage.setItem('Exosk', input.value);
        window.location = 'pages/jogo.html';
    };

    input.addEventListener('input', validateInput);
    form.addEventListener('submit', handleSubmit);

});