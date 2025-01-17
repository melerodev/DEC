import { Socket } from "socket.io";
import { Directions, Player, PlayerStates } from "../player/entities/Player";
import { Room } from "../room/entities/Room";
import { RoomService } from "../room/RoomService";
import { Game, GameStates } from "./entities/Game";
import { BoardBuilder } from "./BoardBuilder";
import { ServerService } from "../server/ServerService";

export class GameService {
    private games: Game[];

    private static instance: GameService;
    private constructor() {
        this.games = [];
    };

    static getInstance(): GameService {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new GameService();
        return this.instance;
    }

    public buildPlayer(socket: Socket): Player {
        return {
            id: socket,
            x: 0,
            y: 0,
            state: PlayerStates.Idle,
            direction: Directions.Up,
            visibility: true
        }
    }

    public addPlayer(player: Player): boolean {
        const room: Room = RoomService.getInstance().addPlayer(player);
        const genRanHex = (size: Number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        if (room.players.length == 1) {
            const game: Game = {
                id: "game" + genRanHex(128),
                state: GameStates.WAITING,
                room: room,
                board: new BoardBuilder().getBoard(),
                numberOfPlayers: room.players.length,

            }
            room.game = game;
            this.games.push(game);
        } else if (room.game) {
            room.game.numberOfPlayers = room.players.length;
        }
        
        if (room.occupied) {
            if (room.game) {
                room.game.state = GameStates.PLAYING;
                if (ServerService.getInstance().isActive()) {
                    ServerService.getInstance().gameStartMessage();
                }
            }
            return true;
        }
        
        console.log("Player " + player.id.id + " added to room " + room.name);
        return false;
    }

    public removePlayer(player: Player): void {
        const room = RoomService.getInstance().getRoomByPlayer(player);
        if (room) {
            RoomService.getInstance().removePlayer(player);
            if (room.game) {
                room.game.state = GameStates.WAITING;
                room.game.numberOfPlayers = room.players.length;
            }
        }

        console.log("Player " + player.id.id + " removed from room " + room?.name);
    }

    public getGameByPlayer(player: Player): Game | undefined {
        return this.games.find(game => game.room.players.includes(player));
    }
}
