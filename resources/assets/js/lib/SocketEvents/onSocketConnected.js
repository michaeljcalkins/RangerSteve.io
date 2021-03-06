import GameConsts from "lib/GameConsts";
import getParameterByName from "../GetParameterByName.js";
import Client from "../Client";

export default function onSocketConnected() {
  const { store } = this.game;
  const state = store.getState();

  Client.getId(id => {
    window.SOCKET_ID = id;

    let data = {
      x: 0,
      y: 0,
      weaponId:
        state.player.currentWeapon === "primaryWeapon"
          ? state.player.selectedPrimaryWeaponId
          : state.player.selectedSecondaryWeaponId,
      nickname: state.player.nickname,
      uid: state.player.uid,
      isPremium: state.player.isPremium
    };

    // Only specify roomId if specified in url
    if (getParameterByName("roomId")) {
      data.roomId = getParameterByName("roomId");
    }

    // Only specify map if specified in url
    if (getParameterByName("map")) {
      data.map = getParameterByName("map");
    }

    // Only specify gamemode if specified in url
    if (getParameterByName("gamemode")) {
      data.gamemode = getParameterByName("gamemode");
    }

    // Only specify mode if specified in url
    if (getParameterByName("mode")) {
      data.mode = getParameterByName("mode");
    }

    Client.send(GameConsts.EVENT.NEW_PLAYER, data);
  });
}
