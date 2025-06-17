document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('.login-form');
    const playButton = form.querySelector('.login__btn[type="submit"]');
    const dropdownButtons = document.querySelectorAll('.dropdown__btn');

    const openRulesBtn = document.getElementById('open-rules-btn');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    const rulesOverlay = document.getElementById('rules-overlay');

    const openRankingBtn = document.getElementById('btn-mostrar-ranking');
    const closeRankingBtn = document.getElementById('close-ranking-btn');
    const rankingOverlay = document.getElementById('ranking-overlay');
    const listaRanking = document.getElementById('lista-ranking');

    const selections = {
        mode: null,
        difficulty: null
    };

    const validateForm = () => {
        const modeIsSelected = selections.mode !== null;
        const difficultyIsSelected = selections.difficulty !== null;

        if (modeIsSelected && difficultyIsSelected) {
            playButton.removeAttribute('disabled');
        } else {
            playButton.setAttribute('disabled', '');
        }
    };

    dropdownButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const content = button.nextElementSibling;

            document.querySelectorAll('.dropdown__content').forEach(otherContent => {
                if (otherContent !== content) {
                    otherContent.classList.remove('show');
                }
            });
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
        localStorage.setItem('player', 'Convidado');
        localStorage.setItem('gameMode', selections.mode);
        localStorage.setItem('gameDifficulty', selections.difficulty);
        window.location.href = 'pages/jogo.html';
    };
    form.addEventListener('submit', handleSubmit);

    if (openRulesBtn && rulesOverlay) {
        openRulesBtn.addEventListener('click', () => {
            rulesOverlay.classList.add('show');
        });
    }

    if (closeRulesBtn && rulesOverlay) {
        closeRulesBtn.addEventListener('click', () => {
            rulesOverlay.classList.remove('show');
        });
    }

    if (openRankingBtn && rankingOverlay) {
        openRankingBtn.addEventListener('click', async () => {
            rankingOverlay.classList.add('show');

            listaRanking.innerHTML = '<li style="text-align: center; color: #886c5c;">Carregando ranking...</li>';
            try {
                const response = await fetch('http://localhost:3000/ranking');

                listaRanking.innerHTML = '';

                if (response.ok) {
                    const rankingData = await response.json();

                    if (rankingData.length === 0) {
                        listaRanking.innerHTML = '<li style="text-align: center; color: #886c5c;">Nenhuma pontuação registrada ainda. Jogue para aparecer aqui!</li>';
                    } else {
                        rankingData.forEach((entry, index) => {
                            const listItem = document.createElement('li');
                            const dataFormatada = new Date(entry.data).toLocaleDateString('pt-BR', {
                                year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                            });
                            listItem.innerHTML = `<span>${index + 1}. ${entry.jogador} (${entry.modo_jogo} / ${entry.dificuldade_jogo})</span>` +
                                `<span>Pontos: Você ${entry.pontos} / IA ${entry.pontos_maquina}</span>`;
                            listaRanking.appendChild(listItem);
                        });
                    }
                } else {
                    const errorBody = await response.json();
                    listaRanking.innerHTML = `<li style="text-align: center; color: #8a0303;">Erro ao carregar ranking: ${errorBody.error || response.statusText}</li>`;
                    console.error('Erro ao carregar ranking:', response.status, errorBody.error);
                }
            } catch (error) {
                listaRanking.innerHTML = '<li style="text-align: center; color: #8a0303;">Não foi possível conectar ao servidor do ranking.</li>';
                console.error('Erro de rede ao carregar ranking:', error);
            }
        });
    }

    if (closeRankingBtn && rankingOverlay) {
        closeRankingBtn.addEventListener('click', () => {

            rankingOverlay.classList.remove('show');
        });
    }

    window.addEventListener('click', (event) => {

        if (!event.target.matches('.dropdown__btn')) {
            document.querySelectorAll('.dropdown__content').forEach(content => {
                content.classList.remove('show');
            });
        }

        if (event.target === rulesOverlay) {
            rulesOverlay.classList.remove('show');
        }
        if (event.target === rankingOverlay) {
            rankingOverlay.classList.remove('show');
        }
    });

});