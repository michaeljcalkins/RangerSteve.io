import { assert } from "chai";

import getPlayerWithBestAccuracy from "./getPlayerWithBestAccuracy";

describe("getPlayerMetaWithBestAccuracy", function() {
  it("should return false if there not enough data to calculate stat", function() {
    const room = {
      players: {
        VNd8DVD3GMWBlYVsAAAK: {
          nickname: "Noob",
          bulletsFired: 0,
          bulletsHit: 0
        },
        "1Nd8DVD3GMWBlYVsAAAK": {
          nickname: "Noob 2",
          bulletsFired: 19,
          bulletsHit: 0
        }
      }
    };
    assert.equal(getPlayerWithBestAccuracy(room), false);
  });

  it("should return object if there is enough data to calculate stat", function() {
    const room = {
      players: {
        VNd8DVD3GMWBlYVsAAAK: {
          nickname: "Noob",
          bulletsFired: 0,
          bulletsHit: 0
        },
        undefined: {
          nickname: undefined,
          bulletsFired: undefined,
          bulletsHit: undefined
        },
        "1Nd8DVD3GMWBlYVsAAAK": {
          nickname: "Noob 2",
          bulletsFired: 19,
          bulletsHit: 0
        },
        gpjE8jZgPNseoxfVAAAJ: {
          nickname: "Master",
          bulletsFired: 4,
          bulletsHit: 2
        }
      }
    };
    const correctPlayerMeta = { nickname: "Master", score: "50.0%" };
    assert.deepEqual(getPlayerWithBestAccuracy(room), correctPlayerMeta);
  });
});
