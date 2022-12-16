import plantBegonia_1_ from "./plant1-1-.webp";
import plantBegonia_1 from "./plant1-1.webp";
import plantBegonia_3_ from "./plant1-3-.webp";
import plantBegonia_3 from "./plant1-3.webp";
import plantBegonia_5 from "./plant1-5.webp";

import plantMirrorGrass_1_ from "./plant2-1-.webp";
import plantMirrorGrass_1 from "./plant2-1.webp";
import plantMirrorGrass_3_ from "./plant2-3-.webp";
import plantMirrorGrass_3 from "./plant2-3.webp";
import plantMirrorGrass_5 from "./plant2-5.webp";

import plantTravelerBanana_1_ from "./plant3-1-.webp";
import plantTravelerBanana_1 from "./plant3-1.webp";
import plantTravelerBanana_3_ from "./plant3-3-.webp";
import plantTravelerBanana_3 from "./plant3-3.webp";
import plantTravelerBanana_5 from "./plant3-5.webp";

import plantPhilodendron_1_ from "./plant4-1-.webp";
import plantPhilodendron_1 from "./plant4-1.webp";
import plantPhilodendron_3_ from "./plant4-3-.webp";
import plantPhilodendron_3 from "./plant4-3.webp";
import plantPhilodendron_5 from "./plant4-5.webp";

import plantCeriman_1_ from "./plant5-1-.webp";
import plantCeriman_1 from "./plant5-1.webp";
import plantCeriman_3_ from "./plant5-3-.webp";
import plantCeriman_3 from "./plant5-3.webp";
import plantCeriman_5 from "./plant5-5.webp";

import plantBirdOfParadise_1_ from "./plant6-1-.webp";
import plantBirdOfParadise_1 from "./plant6-1.webp";
import plantBirdOfParadise_3_ from "./plant6-3-.webp";
import plantBirdOfParadise_3 from "./plant6-3.webp";
import plantBirdOfParadise_5 from "./plant6-5.webp";

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
