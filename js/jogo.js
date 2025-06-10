const grid = document.querySelector('.grid');
const spanPlayer = document.querySelector('.player-name strong');
const timer = document.querySelector('.timer');
const competitiveScoreboard = document.querySelector('#competitive-score');
const cooperativeScoreboard = document.querySelector('#cooperative-score');
const playerScoreSpan = document.querySelector('#player-score');
const machineScoreSpan = document.querySelector('#machine-score');
const sharedScoreSpan = document.querySelector('#shared-score');

const btnHint = document.querySelector('#btn-dica');
const btnReveal = document.querySelector('#btn-reveal');
const btnShuffle = document.querySelector('#btn-shuffle');
const btnFreeze = document.querySelector('#btn-freeze');

const playerName = localStorage.getItem('player') || 'Convidado';
const dificuldade = localStorage.getItem('gameDifficulty') || 'easy';
const gameMode = localStorage.getItem('gameMode') || 'competitive';

let revealedCards = [];
let loop;
let blockClick = false;
let isGameOver = false;

let vezDoJogador = true;
let playerScore = 0;
let machineScore = 0;
let sharedScore = 0;
let machineMemory = [];
const CHANCE_DE_LEMBRAR = 0.75;
const TIME_PENALTY_SECONDS = 10;

const cooperativeTimeSettings = {
    easy: 100, medium: 150, hard: 200, extreme: 240,
};

const personagens = [
    '1695156937388z_800x800', 'arrowskeleton', 'beast', 'cavaleiros',
    'magobranco', 'magos', 'purple', 'queen', 'reddragon', 'torre',
    'unicorn', 'cthulhu'
];

const difficultySettings = {
    easy: { groupSize: 2, totalCharacters: 12 },
    medium: { groupSize: 3, totalCharacters: 8 },
    hard: { groupSize: 4, totalCharacters: 6 },
    extreme: { isSpecial: true, composition: { quadras: 4, trincas: 2, pares: 1 } }
};

const config = difficultySettings[dificuldade];
let totalCardsInGame = 0;
let groupSizes = {};

const MAX_SPECIAL = 3;
let usedSpecial = 0;
let maxHints = 3;
let hintsUsed = 0;
let correctStreak = 0;

let freezeState = null;
let poderesUsados = { reveal: false, shuffle: false, freeze: false };

function atualizarEstadoBotoes() {
    const jogadorPodeAgir = vezDoJogador && !blockClick;
    btnHint.disabled = !jogadorPodeAgir || (hintsUsed >= maxHints);
    const podeUsarPoderEspecial = jogadorPodeAgir && (usedSpecial < MAX_SPECIAL);
    btnReveal.disabled = !podeUsarPoderEspecial || poderesUsados.reveal;
    btnShuffle.disabled = !podeUsarPoderEspecial || poderesUsados.shuffle;
}

const updateScore = (character) => {
    if (gameMode === 'cooperative') {
        sharedScore++;
        sharedScoreSpan.textContent = sharedScore;
    } else { // Lógica para o Modo Competitivo
        const specialCardCharacter = '1695156937388z_800x800';
        let points = 100; // Pontuação padrão por acerto

        if (character === specialCardCharacter) {
            points = 150; // Pontuação para a carta especial
        }

        if (vezDoJogador) {
            playerScore += points;
            playerScoreSpan.textContent = playerScore;
        } else {
            machineScore += points;
            machineScoreSpan.textContent = machineScore;
        }
    }
};

const endGame = (didWin) => {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(loop);
    blockClick = true;
    btnHint.disabled = true;
    btnReveal.disabled = true;
    btnShuffle.disabled = true;
    btnFreeze.disabled = true;
    const endMessage = document.createElement('div');
    endMessage.className = 'end-game-message';
    if (didWin) {
        if (gameMode === 'cooperative') {
            endMessage.innerHTML = `VITÓRIA! <br> Vocês limparam o tabuleiro com ${timer.innerHTML} segundos restantes!`;
        } else {
            let winnerMessage = `Fim de Jogo! Placar Final: <br> Você ${playerScore} x ${machineScore} IA`;
            if (playerScore > machineScore) {
                winnerMessage += '<br>Você Venceu!';
            } else if (machineScore > playerScore) {
                winnerMessage += '<br>A IA Venceu!';
            } else {
                winnerMessage += '<br>Empate!';
            }
            endMessage.innerHTML = winnerMessage;
        }
    } else {
        endMessage.innerHTML = `TEMPO ESGOTADO! <br> Mais sorte na próxima vez.`;
    }
    document.body.appendChild(endMessage);
};

const checkEndGame = () => {
    const disabledCards = document.querySelectorAll('.disabled-card.card');
    if (disabledCards.length === totalCardsInGame) {
        endGame(true);
    }
};

const applyTimePenalty = () => {
    if(isGameOver || gameMode !== 'cooperative') return;
    let currentTime = Number(timer.innerHTML);
    currentTime -= TIME_PENALTY_SECONDS;
    timer.classList.add('time-penalty');
    setTimeout(() => timer.classList.remove('time-penalty'), 500);
    if (currentTime <= 0) {
        timer.innerHTML = 0;
        endGame(false);
    } else {
        timer.innerHTML = currentTime;
    }
};

const checkMatch = () => {
    if (isGameOver || revealedCards.length === 0) return;
    const firstCharacter = revealedCards[0].getAttribute('data-character');
    const allMatch = revealedCards.every(card => card.getAttribute('data-character') === firstCharacter);

    if (allMatch) {
        updateScore(firstCharacter);

        // Apenas desabilita as cartas. O brilho dourado já foi aplicado em revealCard
        // e permanecerá, pois a carta não será desvirada.
        revealedCards.forEach(card => {
            card.classList.add('disabled-card');
            card.classList.add('reveal-card');
        });

        revealedCards = [];
        checkEndGame();
        correctStreak++;
        if (correctStreak > 0 && correctStreak % 2 === 0) {
            if (hintsUsed > 0) {
                hintsUsed--;
                console.log("Você ganhou uma dica de volta!");
            }
        }
        if (!vezDoJogador) {
            setTimeout(jogadaDaMaquina, 1000);
        } else {
            blockClick = false;
        }
    } else {
        // Lógica de erro
        correctStreak = 0;
        vezDoJogador = !vezDoJogador;
        blockClick = true;
        setTimeout(() => {
            if (isGameOver) return;
            revealedCards.forEach(card => {
                if (!card.classList.contains('disabled-card')) {
                    card.classList.remove('reveal-card');
                    // NOVO: Remove a classe dourada se o par estiver errado
                    card.classList.remove('special-card-gold');
                }
            });
            revealedCards = [];
            if (vezDoJogador) {
                blockClick = false;
            } else {
                setTimeout(jogadaDaMaquina, 500);
            }
            atualizarEstadoBotoes();
        }, 1200);
    }
    atualizarEstadoBotoes();
};
const revealCard = ({ currentTarget }) => {
    if (blockClick || isGameOver ||
        currentTarget.classList.contains('reveal-card') ||
        currentTarget.classList.contains('disabled-card')) {
        return;
    }
    if (gameMode === 'competitive' && !vezDoJogador) return;

    // Adiciona a classe que dispara a animação do CSS
    currentTarget.classList.add('reveal-card');

    // NOVO: Adiciona o brilho dourado imediatamente ao virar a carta especial
    const specialCardCharacter = '1695156937388z_800x800';
    if (gameMode === 'competitive' && currentTarget.getAttribute('data-character') === specialCardCharacter) {
        currentTarget.classList.add('special-card-gold');
    }

    revealedCards.push(currentTarget);
    registerMemory(currentTarget);

    const firstCardCharacter = revealedCards[0].getAttribute('data-character');
    const requiredGroupSize = config.isSpecial ? groupSizes[firstCardCharacter] : config.groupSize;

    if (revealedCards.length === requiredGroupSize) {
        blockClick = true;
        atualizarEstadoBotoes();
        setTimeout(checkMatch, 500);
    }
};

const createElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
};

const createCard = (personagem) => {
    const card = createElement('div', 'card');
    const front = createElement('div', 'face front');
    const back = createElement('div', 'face back');
    front.style.backgroundImage = `url(../imagens/${personagem}.jpg)`;
    card.appendChild(front);
    card.appendChild(back);
    card.setAttribute('data-character', personagem);
    card.dataset.id = crypto.randomUUID();
    card.addEventListener('click', revealCard);
    return card;
};

const setupUIForGameMode = () => {
    // Oculta o botão de congelar em TODOS os modos de jogo.
    btnFreeze.style.display = 'none';

    if (gameMode === 'cooperative') {
        cooperativeScoreboard.style.display = 'block';
        competitiveScoreboard.style.display = 'none';
        btnShuffle.style.display = 'none'; // Mantém o poder de embaralhar oculto no cooperativo
    } else {
        cooperativeScoreboard.style.display = 'none';
        competitiveScoreboard.style.display = 'block';
        btnShuffle.style.display = 'inline-block'; // Garante que o embaralhar apareça no competitivo
    }
};
const loadGame = () => {
    isGameOver = false;
    playerScore = 0; machineScore = 0; sharedScore = 0;
    playerScoreSpan.textContent = '0'; machineScoreSpan.textContent = '0'; sharedScoreSpan.textContent = '0';
    usedSpecial = 0;
    hintsUsed = 0;
    if (freezeState) {
        freezeState.card.classList.remove('frozen');
    }
    freezeState = null;
    machineMemory = [];
    poderesUsados = { reveal: false, shuffle: false, freeze: false };
    setupUIForGameMode();

    let cardsToShuffle = [];
    const specialChar = '1695156937388z_800x800';
    let otherCharacters = personagens.filter(p => p !== specialChar);

    if (config.isSpecial) { // Lógica para o modo Extremo (VERSÃO ROBUSTA E GARANTIDA)
        const { quadras, trincas, pares } = config.composition;
        const totalUniqueCharsNeeded = quadras + trincas + pares; // Ex: 4 + 2 + 1 = 7

        // 1. Garante a inclusão da carta especial na lista de personagens do jogo.
        let finalCharacters = [specialChar];

        // 2. Sorteia as outras 6 cartas necessárias da lista de personagens restantes.
        otherCharacters.sort(() => Math.random() - 0.5);
        const otherCharsToPick = otherCharacters.slice(0, totalUniqueCharsNeeded - 1);
        finalCharacters.push(...otherCharsToPick);

        // 3. Embaralha a lista final de 7 personagens. Isso faz com que a carta especial
        //    possa ser, aleatoriamente, um par, uma trinca ou uma quadra.
        finalCharacters.sort(() => Math.random() - 0.5);

        // 4. Distribui os personagens escolhidos para formar os grupos de cartas.
        const assignCharsToGroups = (count, groupSize) => {
            for (let i=0; i < count; i++) {
                const char = finalCharacters.pop();
                if (!char) break;
                groupSizes[char] = groupSize;
                for (let j=0; j < groupSize; j++) {
                    cardsToShuffle.push(char);
                }
            }
        };

        assignCharsToGroups(quadras, 4);
        assignCharsToGroups(trincas, 3);
        assignCharsToGroups(pares, 2);

    } else { // Lógica para os modos Fácil, Médio e Difícil (mantida como antes)

        otherCharacters.sort(() => Math.random() - 0.5);
        const numOtherCharsToSelect = config.totalCharacters - 1;
        const selectedOtherChars = otherCharacters.slice(0, numOtherCharsToSelect);
        const charactersForLevel = [specialChar, ...selectedOtherChars];

        charactersForLevel.forEach(character => {
            for (let i = 0; i < config.groupSize; i++) {
                cardsToShuffle.push(character);
            }
        });
    }

    totalCardsInGame = cardsToShuffle.length;
    const shuffledArray = cardsToShuffle.sort(() => Math.random() - 0.5);
    grid.innerHTML = '';
    shuffledArray.forEach((personagem) => {
        const card = createCard(personagem);
        grid.appendChild(card);
    });
    atualizarEstadoBotoes();
};

const startTime = () => {
    clearInterval(loop);
    if (gameMode === 'cooperative') {
        let startingTime = cooperativeTimeSettings[dificuldade];
        timer.innerHTML = startingTime;
        loop = setInterval(() => {
            if(isGameOver) return;
            let currentTime = Number(timer.innerHTML);
            currentTime--;
            timer.innerHTML = currentTime;
            if (currentTime <= 0) {
                endGame(false);
            }
        }, 1000);
    } else {
        timer.innerHTML = 0;
        loop = setInterval(() => {
            if(isGameOver) return;
            const currentTime = Number(timer.innerHTML);
            timer.innerHTML = currentTime + 1;
        }, 1000);
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getMemoryLimit() {
    if (dificuldade === 'easy') return 6;
    if (dificuldade === 'medium') return 12;
    return 999;
}

function registerMemory(card) {
    const alreadyInMemory = machineMemory.some(memCard => memCard.id === card.dataset.id);
    if (!alreadyInMemory) {
        machineMemory.push({
            id: card.dataset.id,
            character: card.getAttribute('data-character'),
        });
    }
    const memoryLimit = getMemoryLimit();
    while (machineMemory.length > memoryLimit) {
        machineMemory.shift();
    }
}

async function jogadaDaMaquina() {
    if (freezeState) {
        freezeState.turnsLeft--;
        console.log(`Turno da IA. Congelamento restante: ${freezeState.turnsLeft} turnos.`);
        if (freezeState.turnsLeft <= 0) {
            console.log("A carta foi descongelada.");
            freezeState.card.classList.remove('frozen');
            freezeState = null;
        }
    }
    if(isGameOver) return;
    blockClick = true;
    atualizarEstadoBotoes();
    await delay(1000);
    let availableCards = Array.from(document.querySelectorAll('.card:not(.disabled-card):not(.reveal-card)'));
    if (freezeState) {
        availableCards = availableCards.filter(card => card !== freezeState.card);
    }
    let cardsToPlay = [];
    const memoryGroupedByChar = machineMemory.reduce((acc, card) => {
        acc[card.character] = acc[card.character] || [];
        if (availableCards.find(c => c.dataset.id === card.id)) {
            acc[card.character].push(card.id);
        }
        return acc;
    }, {});
    for (const character in memoryGroupedByChar) {
        const requiredSize = config.isSpecial ? groupSizes[character] : config.groupSize;
        if (memoryGroupedByChar[character].length >= requiredSize) {
            if (Math.random() < CHANCE_DE_LEMBRAR) {
                cardsToPlay = memoryGroupedByChar[character]
                    .slice(0, requiredSize)
                    .map(id => document.querySelector(`.card[data-id='${id}']`))
                    .filter(card => card && !card.classList.contains('disabled-card'));
                if (cardsToPlay.length === requiredSize) break;
                else cardsToPlay = [];
            }
        }
    }
    if (cardsToPlay.length === 0 && availableCards.length > 0) {
        let firstPick = availableCards[Math.floor(Math.random() * availableCards.length)];
        cardsToPlay.push(firstPick);
        const characterToMatch = firstPick.getAttribute('data-character');
        const requiredSize = config.isSpecial ? groupSizes[characterToMatch] : config.groupSize;
        while (cardsToPlay.length < requiredSize) {
            let availableForNextPick = availableCards.filter(c => !cardsToPlay.map(p => p.dataset.id).includes(c.dataset.id));
            if (availableForNextPick.length === 0) break;
            let nextPick = null;
            const knownPartners = (memoryGroupedByChar[characterToMatch] || [])
                .map(id => document.querySelector(`.card[data-id='${id}']`))
                .filter(c => c && !cardsToPlay.includes(c));
            if (knownPartners.length > 0) nextPick = knownPartners[0];
            if (!nextPick) nextPick = availableForNextPick[Math.floor(Math.random() * availableForNextPick.length)];
            if (nextPick) cardsToPlay.push(nextPick);
        }
    }
    for (const card of cardsToPlay) {
        if (card && !card.classList.contains('reveal-card')) {
            card.classList.add('reveal-card');

            // NOVO: Adiciona o brilho dourado quando a IA vira a carta especial
            const specialCardCharacter = '1695156937388z_800x800';
            if (gameMode === 'competitive' && card.getAttribute('data-character') === specialCardCharacter) {
                card.classList.add('special-card-gold');
            }

            registerMemory(card);
            revealedCards.push(card);
            await delay(600);
        }
    }
    setTimeout(checkMatch, 500);
}

function activatePower(type) {
    if (usedSpecial >= MAX_SPECIAL || poderesUsados[type]) {
        return;
    }
    usedSpecial++;
    poderesUsados[type] = true;
    switch(type) {
        case 'reveal': triggerReveal(); break;
        case 'shuffle': triggerShuffle(); break;
        case 'freeze': triggerFreeze(); break;
    }
    atualizarEstadoBotoes();
}

function triggerReveal() {
    const hiddenCards = Array.from(document.querySelectorAll('.card:not(.disabled-card)'));
    const counts = {};
    hiddenCards.forEach(c => {
        const ch = c.dataset.character;
        counts[ch] = (counts[ch] || 0) + 1;
    });
    let groupToReveal = null;
    for (const ch in counts) {
        const requiredSize = config.isSpecial ? groupSizes[ch] : config.groupSize;
        if (counts[ch] >= requiredSize) {
            groupToReveal = ch;
            break;
        }
    }

    if (groupToReveal) {
        // Lógica de penalidade
        if (gameMode === 'cooperative') {
            let currentTime = Number(timer.innerHTML);
            let newTime;
            if (dificuldade === 'easy') {
                newTime = currentTime - 30;
                console.log(`Poder Revelar usado! Penalidade de 30 segundos no modo fácil.`);
            } else {
                newTime = Math.floor(currentTime / 2);
                console.log(`Poder Revelar usado! O tempo foi reduzido pela metade.`);
            }
            if (newTime < 0) newTime = 0;
            timer.innerHTML = newTime;
            timer.classList.add('time-penalty');
            setTimeout(() => timer.classList.remove('time-penalty'), 500);
            if (newTime === 0 && !isGameOver) {
                endGame(false);
            }
        } else {
            if (vezDoJogador) {
                playerScore -= 30;
                if (playerScore < 0) playerScore = 0;
                playerScoreSpan.textContent = playerScore;
                console.log('Poder Revelar usado! Penalidade de 30 pontos.');
            }
        }

        // Efeito de revelar as cartas (COM A VERIFICAÇÃO)
        const cardsToHighlight = hiddenCards.filter(card => card.dataset.character === groupToReveal);
        const specialCardCharacter = '1695156937388z_800x800';

        cardsToHighlight.forEach(card => {
            // Adiciona o brilho roxo somente se a carta NÃO for a especial
            if (card.getAttribute('data-character') !== specialCardCharacter) {
                card.classList.add('highlight-reveal');
                setTimeout(() => card.classList.remove('highlight-reveal'), 2000);
            }
        });

    } else {
        alert("Nenhum grupo completo disponível para revelar.");
        usedSpecial--;
        poderesUsados.reveal = false;
        atualizarEstadoBotoes();
    }
}
function triggerShuffle() {
    console.log("Embaralhando cartas...");
    const backCards = Array.from(document.querySelectorAll('.card:not(.reveal-card):not(.disabled-card)'));
    if (backCards.length < 2) {
        alert("Não há cartas suficientes para embaralhar.");
        usedSpecial--;
        poderesUsados.shuffle = false;
        atualizarEstadoBotoes();
        return;
    }
    let cardInfo = backCards.map(card => {
        const frontFace = card.querySelector('.front');
        return {
            character: card.getAttribute('data-character'),
            image: frontFace.style.backgroundImage
        };
    });
    for (let i = cardInfo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardInfo[i], cardInfo[j]] = [cardInfo[j], cardInfo[i]];
    }
    backCards.forEach((card, index) => {
        const frontFace = card.querySelector('.front');
        card.setAttribute('data-character', cardInfo[index].character);
        frontFace.style.backgroundImage = cardInfo[index].image;
    });
    machineMemory = [];
    alert("As cartas viradas foram embaralhadas!");
}

function triggerFreeze() {
    const options = Array.from(document.querySelectorAll('.card:not(.disabled-card):not(.reveal-card)'));
    if (options.length === 0) {
        alert("Não há cartas para congelar.");
        usedSpecial--;
        poderesUsados.freeze = false;
        atualizarEstadoBotoes();
        return;
    }
    const cardToFreeze = options[Math.floor(Math.random() * options.length)];
    freezeState = {
        card: cardToFreeze,
        turnsLeft: 2
    };
    freezeState.card.classList.add('frozen');
    console.log(`Uma carta foi congelada por ${freezeState.turnsLeft} turnos da IA.`);
}

function useHint() {
    // Verifica se o limite de dicas foi atingido
    if (hintsUsed >= maxHints) {
        return;
    }
    // NOVO: Só permite o uso após a primeira jogada (quando alguma pontuação for feita)
    if (playerScore === 0 && machineScore === 0 && sharedScore === 0) {
        alert("A dica só pode ser usada após a primeira jogada.");
        return;
    }

    hintsUsed++;

    // Aplica a penalidade correta com base no modo de jogo
    if (gameMode === 'cooperative') {
        applyTimePenalty(); // Penalidade de tempo no modo cooperativo
    } else { // NOVO: Penalidade de pontos no modo competitivo
        if (vezDoJogador) {
            playerScore -= 20;
            if (playerScore < 0) playerScore = 0; // Impede pontuação negativa
            playerScoreSpan.textContent = playerScore;
            console.log('Dica usada! Penalidade de 20 pontos.');
        }
    }

    atualizarEstadoBotoes();

    // Lógica original para mostrar a dica
    const hidden = Array.from(document.querySelectorAll('.card:not(.reveal-card):not(.disabled-card)'));
    const sample = hidden.sort(() => 0.5 - Math.random()).slice(0, 2);
    if(sample.length > 0) {
        sample.forEach(c => c.classList.add('reveal-card'));
        setTimeout(() => sample.forEach(c => c.classList.remove('reveal-card')), 1000);
    } else {
        alert("Não há cartas suficientes para dar uma dica.");
        hintsUsed--; // Devolve a dica se não pôde ser usada
        atualizarEstadoBotoes();
    }
}
window.onload = () => {
    if(spanPlayer) {
        spanPlayer.textContent = playerName;
    }
    btnReveal.onclick = () => activatePower('reveal');
    btnShuffle.onclick = () => activatePower('shuffle');
    // A linha a seguir foi removida: btnFreeze.onclick = () => activatePower('freeze');
    btnHint.onclick = useHint;
    loadGame();
    startTime();
    vezDoJogador = true;
    atualizarEstadoBotoes();
};