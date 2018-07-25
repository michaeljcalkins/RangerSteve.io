import Client from "./Client";
import GameConsts from "lib/GameConsts";

export default function() {
  Client.send(GameConsts.EVENT.PLAYER_DAMAGED, {
    damage: 100,
    damagedPlayerId: window.SOCKET_ID,
    attackingPlayerId: null
  });
}
