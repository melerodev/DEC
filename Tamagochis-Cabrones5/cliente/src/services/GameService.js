import { Board } from "../entities/Board.js";
import { Queue } from "../Queue.js";

export class GameService {
    #states = {
        WAITING : 0,
        PLAYING : 1,
        ENDED : 2
    };
    #ui = null;
    #players = [];
    #board = null;
    #queue = null;
    #state = null;
    #parallel = null;

    #actionsList = {
        "NEW_PLAYER" : this.do_newPlayer.bind(this),
        "BOARD" : this.do_newBoard.bind(this)
    };

    constructor(ui){
        this.#state = this.#states.WAITING;
        this.#board = new Board();
        this.#queue = new Queue();
        this.#parallel = null;
        this.checkScheduler();
        this.#ui = ui;
    }

    checkScheduler() {
        if (!this.#queue.isEmpty()) {
            if (this.#parallel == null) {
                this.#parallel = setInterval(
                    async ()=>{
                        const action = this.#queue.getMessage();
                        if (action != undefined) {
                            await this.#actionsList[action.type] (action.content);
                        } else {
                            this.stopScheduler();
                        }
                    }
                );
            }
        }
    }

    stopScheduler() {
        clearInterval(this.#parallel);
        this.#parallel = null;
    }

    do (data) {
        this.#queue.addMessage(data);
        this.checkScheduler();
    };

    async do_newPlayer (payload) {
        console.log("Ha llegado un jugador nuevo");
        this.#players.push({ x: payload.x, y: payload.y });

        // Esperar un segundo antes de añadir al jugador al tablero para que de tiempo a crear el tablero
        setTimeout(() => {
            if (this.#state === this.#states.PLAYING) {
                this.#board.addPlayer(payload);
            }
        }, 1);
    };

    async do_newBoard(payload) {
        console.log("Ha llegado un nuevo tablero");
        this.#state = this.#states.PLAYING;
        this.#board.build(payload);
        this.#ui.drawBoard(this.#board.map);
        console.log(this.#board.map);
    }

    getPlayers() {
        return this.#players;
    }
}