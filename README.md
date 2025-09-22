#  Memory Fantasy 
  ⚔️ Link para acesso: https://memory-game-puce-mu.vercel.app ⚔️

*Memory Fantasy* é um jogo da memória temático com ambientação fantástica, desenvolvido como projeto da disciplina de Paradigmas da Computação, lecionada pelo professor Janderson Jason, utilizando *JavaScript, **HTML* e *CSS. O jogador pode escolher entre os modos **Competitivo* (contra a IA "Ghost") ou *Cooperativo*, com diferentes níveis de dificuldade e poderes especiais.

##  Funcionalidades

 *Modos de jogo*:
  - *Competitivo*: você joga contra a IA Ghost.
  - *Cooperativo*: jogue sozinho ou junto com a IA Ghost contra o tempo.

   *Dificuldades disponíveis*:
  - Fácil, Médio, Difícil, Extremo
  - Cada dificuldade altera a composição dos grupos (pares, trincas, quadras).

   *Cartas Especiais*:
  - *Carta Dourada*: vale mais pontos no modo competitivo.
  - Visuais únicos e animações destacadas.

  *Poderes Especiais (limitados)*:
  - *Dica*: revela temporariamente duas cartas no Modo Cooperativo perde 20 segundos e
      Modo Competitivo Perde 20 pontos.
  - *Revelar Grupo*: destaca um grupo completo no tabuleiro.
  - *Embaralhar*: reorganiza as cartas ainda ocultas.
  - *Congelar*: impede que a IA jogue com uma carta por 2 rodadas.

  *Cronômetro e penalidades*:
  - Cronômetro regressivo no modo cooperativo.
  - Penalidades variam conforme o poder e modo de jogo.

  *IA adaptativa (modo competitivo)*:
  - IA com memória limitada, que tenta lembrar posições das cartas.

  *Sistema de Ranking*:
  - Envio e exibição de pontuações com nome do jogador, modo e dificuldade.
  - Integração com back-end para persistência de dados.

## Estilo visual

- Interface temática dark fantasy
- Vídeo de fundo e efeitos visuais imersivos
- Estilo inspirado em RPG medieval
- Responsividade para dispositivos móveis

##  Como rodar o projeto localmente

1. Clone o repositório:
   bash
   git clone https://github.com/CarolinaExosk/memory-game.git
   
2. Acesse a pasta do projeto:
   bash
   cd memory-game
   
3. Abra o arquivo index.html no navegador.

> ⚠ *Para que o ranking funcione*, é necessário um servidor backend local rodando na porta 3000 (endpoints /pontuar e /ranking).

De maneira simplificada, acesse o link memory-game-puce-mu.vercel.app.
O banco de dados foi feito num servidor local de forma que o acesso a ele apenas é realizado na mesma rede em que o computador principal está conectado, onde o servidor foi criado.

##  Estrutura de diretórios


memory-game/
├── index.html               # Tela inicial com seleção de modo e dificuldade
├── pages/
│   └── jogo.html            # Página principal do jogo
├── css/
│   ├── reset.css
│   ├── login.css
│   └── jogo.css
├── js/
│   ├── login.js
│   └── jogo.js
├── imagens/
│   ├── cartas/              # Imagens das cartas
│   ├── fundo, botão, ícones
│   └── logindarkbackground.mp4


##  Créditos

Projeto desenvolvido por [Israel Bezerra] e [Carolina Fonseca](https://github.com/CarolinaExosk) como parte do curso de Ciência da Computação, da Universidade Estadual da Paraíba, disciplina Paradigmas da Computação.
