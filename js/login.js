document.addEventListener('DOMContentLoaded', () => {

    const loginMusic = document.getElementById('login-music');
    const muteButtonLogin = document.getElementById('btn-mute-login');

    if (loginMusic && muteButtonLogin) {
        const muteIconLogin = muteButtonLogin.querySelector('i');

        const startLoginMusic = () => {
            const promise = loginMusic.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.log("A música de login foi bloqueada pelo navegador. Clique na tela para iniciar.");
                    document.body.addEventListener('click', startLoginMusic, { once: true });
                });
            }
        };

        loginMusic.volume = 0.4;
        startLoginMusic();

        muteButtonLogin.addEventListener('click', (event) => {
            event.stopPropagation();
            loginMusic.muted = !loginMusic.muted;
            if (loginMusic.muted) {
                muteIconLogin.className = 'fa-solid fa-volume-mute';
                muteButtonLogin.classList.add('muted-state');
            } else {
                if (loginMusic.paused) {
                    loginMusic.play();
                }
                muteIconLogin.className = 'fa-solid fa-volume-high';
                muteButtonLogin.classList.remove('muted-state');
            }
        });
    }

    const form = document.querySelector('.login-form');
    const playButton = form.querySelector('.login__btn[type="submit"]');
    const dropdownButtons = document.querySelectorAll('.dropdown__btn');

    const openRulesBtn = document.getElementById('open-rules-btn');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    const rulesOverlay = document.getElementById('rules-overlay');

    const openRankingBtn = document.getElementById('btn-mostrar-ranking');
    const closeRankingBtn = document.getElementById('close-ranking-btn');
    const rankingOverlay = document.getElementById('ranking-overlay');
    const rankingContainer = document.getElementById('lista-ranking');

    const API_BASE_URL = 'https://memory-game-production-403e.up.railway.app';

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
            rankingContainer.innerHTML = '<li style="text-align: center; color: #886c5c;">Carregando ranking...</li>';
            try {
                const response = await fetch(`${API_BASE_URL}/ranking`);

                if (response.ok) {
                    const rankingData = await response.json();
                    rankingContainer.innerHTML = '';

                    if (rankingData.length === 0) {
                        rankingContainer.innerHTML = '<li style="text-align: center; color: #886c5c;">Nenhuma pontuação registrada ainda. Jogue para aparecer aqui!</li>';
                        return;
                    }

                    const competitiveData = rankingData.filter(e => e.modo_jogo === 'competitive');
                    const cooperativeData = rankingData.filter(e => e.modo_jogo === 'cooperative');

                    competitiveData.sort((a, b) => b.pontos - a.pontos);
                    cooperativeData.sort((a, b) => {
                        if (a.tempo_final === null) return 1;
                        if (b.tempo_final === null) return -1;
                        return a.tempo_final - b.tempo_final;
                    });

                    const formatarTempo = (segundosTotais) => {
                        if (segundosTotais === undefined || segundosTotais === null) return '';
                        const minutos = Math.floor(segundosTotais / 60);
                        const segundos = segundosTotais % 60;
                        return `${minutos}:${segundos.toString().padStart(2, '0')}`;
                    };

                    const twoColumnsContainer = document.createElement('div');
                    twoColumnsContainer.style.display = 'flex';
                    twoColumnsContainer.style.justifyContent = 'space-between';
                    twoColumnsContainer.style.gap = '20px';
                    twoColumnsContainer.style.flexWrap = 'wrap';

                    const createRankingList = (title, data, mode) => {
                        const column = document.createElement('div');
                        column.style.flex = '1';
                        column.style.minWidth = '250px';

                        const a_title = document.createElement('h3');
                        a_title.textContent = title;
                        a_title.classList.add('ranking-column-title');

                        const list = document.createElement('ul');
                        list.style.listStyle = 'none';
                        list.style.padding = '0';

                        if (data.length === 0) {
                            const emptyItem = document.createElement('li');
                            emptyItem.textContent = 'Nenhum registro.';
                            emptyItem.style.textAlign = 'center';
                            emptyItem.style.color = '#886c5c';
                            list.appendChild(emptyItem);
                        } else {
                            data.forEach((entry, index) => {
                                const listItem = document.createElement('li');
                                const playerInfo = `<span>${index + 1}. ${entry.jogador} (${entry.dificuldade_jogo})</span>`;

                                let scoreInfo = '';
                                if (mode === 'competitive') {
                                    scoreInfo = `<span>Pontos: ${entry.pontos} | IA: ${entry.pontos_maquina}</span>`;
                                } else {
                                    const textoTempo = formatarTempo(entry.tempo_final) ? ` | Tempo: ${formatarTempo(entry.tempo_final)}` : '';
                                    scoreInfo = `<span>Grupos: ${entry.pontos}${textoTempo}</span>`;
                                }

                                listItem.innerHTML = playerInfo + scoreInfo;
                                list.appendChild(listItem);
                            });
                        }

                        column.appendChild(a_title);
                        column.appendChild(list);
                        return column;
                    };

                    const competitiveColumn = createRankingList('Competitivo', competitiveData, 'competitive');
                    const cooperativeColumn = createRankingList('Cooperativo', cooperativeData, 'cooperative');

                    twoColumnsContainer.appendChild(competitiveColumn);
                    twoColumnsContainer.appendChild(cooperativeColumn);

                    rankingContainer.appendChild(twoColumnsContainer);

                } else {
                    const errorBody = await response.json();
                    rankingContainer.innerHTML = `<li style="text-align: center; color: #8a0303;">Erro ao carregar ranking: ${errorBody.error || response.statusText}</li>`;
                    console.error('Erro ao carregar ranking:', response.status, errorBody.error);
                }
            } catch (error) {
                rankingContainer.innerHTML = '<li style="text-align: center; color: #8a0303;">Não foi possível conectar ao servidor do ranking.</li>';
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
