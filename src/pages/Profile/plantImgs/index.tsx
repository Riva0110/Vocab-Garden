const plantBegonia_1_ = require("./plant1-1-.png");
const plantBegonia_1 = require("./plant1-1.png");
const plantBegonia_3_ = require("./plant1-3-.png");
const plantBegonia_3 = require("./plant1-3.png");
const plantBegonia_5 = require("./plant1-5.png");

const plantMirrorGrass_1_ = require("./plant2-1-.png");
const plantMirrorGrass_1 = require("./plant2-1.png");
const plantMirrorGrass_3_ = require("./plant2-3-.png");
const plantMirrorGrass_3 = require("./plant2-3.png");
const plantMirrorGrass_5 = require("./plant2-5.png");

const plantTravelerBanana_1_ = require("./plant3-1-.png");
const plantTravelerBanana_1 = require("./plant3-1.png");
const plantTravelerBanana_3_ = require("./plant3-3-.png");
const plantTravelerBanana_3 = require("./plant3-3.png");
const plantTravelerBanana_5 = require("./plant3-5.png");

const plantPhilodendron_1_ = require("./plant4-1-.png");
const plantPhilodendron_1 = require("./plant4-1.png");
const plantPhilodendron_3_ = require("./plant4-3-.png");
const plantPhilodendron_3 = require("./plant4-3.png");
const plantPhilodendron_5 = require("./plant4-5.png");

const plantCeriman_1_ = require("./plant5-1-.png");
const plantCeriman_1 = require("./plant5-1.png");
const plantCeriman_3_ = require("./plant5-3-.png");
const plantCeriman_3 = require("./plant5-3.png");
const plantCeriman_5 = require("./plant5-5.png");

const plantBirdOfParadise_1_ = require("./plant6-1-.png");
const plantBirdOfParadise_1 = require("./plant6-1.png");
const plantBirdOfParadise_3_ = require("./plant6-3-.png");
const plantBirdOfParadise_3 = require("./plant6-3.png");
const plantBirdOfParadise_5 = require("./plant6-5.png");

type ImgInterface = Record<string, string>;

export const plantImgsObj: Record<string, ImgInterface> = {
  begonia: {
    0: plantBegonia_1,
    3: plantBegonia_3,
    5: plantBegonia_5,
    minus3: plantBegonia_3_,
    minus1: plantBegonia_1_,
  },
  mirrorGrass: {
    0: plantMirrorGrass_1,
    3: plantMirrorGrass_3,
    5: plantMirrorGrass_5,
    minus3: plantMirrorGrass_3_,
    minus1: plantMirrorGrass_1_,
  },
  travelerBanana: {
    0: plantTravelerBanana_1,
    3: plantTravelerBanana_3,
    5: plantTravelerBanana_5,
    minus3: plantTravelerBanana_3_,
    minus1: plantTravelerBanana_1_,
  },
  philodendron: {
    0: plantPhilodendron_1,
    3: plantPhilodendron_3,
    5: plantPhilodendron_5,
    minus3: plantPhilodendron_3_,
    minus1: plantPhilodendron_1_,
  },
  ceriman: {
    0: plantCeriman_1,
    3: plantCeriman_3,
    5: plantCeriman_5,
    minus3: plantCeriman_3_,
    minus1: plantCeriman_1_,
  },
  birdOfParadise: {
    0: plantBirdOfParadise_1,
    3: plantBirdOfParadise_3,
    5: plantBirdOfParadise_5,
    minus3: plantBirdOfParadise_3_,
    minus1: plantBirdOfParadise_1_,
  },
};
