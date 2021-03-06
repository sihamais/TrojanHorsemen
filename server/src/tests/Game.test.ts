import { FirewallCard } from "../gamelogic/FirewallCard";
import { Action } from "../gamelogic/Action";
import { Color } from "../gamelogic/Card";
import { Game } from "../gamelogic/Game";
import { GeneratorCard } from "../gamelogic/GeneratorCard";
import { Player, Species } from "../gamelogic/Players";
import { VirusCard } from "../gamelogic/VirusCard";
import { SpecialCard } from "../gamelogic/SpecialCard";

let game: Game;
const targetPlayer = 1;

beforeEach(() => {
  game = new Game();
  game.addPlayer(new Player("one", Species.Totox));
  game.addPlayer(new Player("two", Species.Hutex));
  game.init();
  game.currentPlayerIdx = 0;
});
describe("small checkup", () => {
  let indx = 0;
  let decklen = 0;
  let handlen = 0;
  let similiarty = 0;
  let cardrawed = 3;
  let nberplayer = 0;
  const temparray: any[] = [];

  test("Check if the % of erreur is lesser than 5% ", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.5);
    game.deck = [];
    game.createDeck();
    decklen = game.deck.length;

    for (indx = 0; indx < decklen; ++indx) temparray[indx] = game.deck[indx];

    game.shuffleDeck();

    for (indx = 0; indx < decklen; ++indx)
      if (
        game.deck[indx] === temparray[indx] &&
        temparray[indx].color == game.deck[indx].color
      ) {
        similiarty++;
      }
    similiarty = (similiarty * decklen) / 100;

    expect(similiarty).toBeLessThan(5);
  });
  test("Check if people can draw cards ", () => {
    handlen = game.currentPlayer.hand.length;
    game.draw(cardrawed);
    cardrawed = cardrawed + handlen;

    expect(cardrawed).toBe(game.currentPlayer.hand.length);
  });
  test("Check if the distribution went smoothly ", () => {
    nberplayer = game.players.length;
    for (indx = 0; indx < nberplayer; indx++)
      temparray[indx] = game.players[indx].hand.length;

    //distribute 3 cards
    game.distribute();

    for (indx = 0; indx < nberplayer; indx++)
      expect(temparray[indx] + 3).toBe(game.players[indx].hand.length);
  });
});

describe("checkActionGenerator", () => {
  let action: Action;
  const color = Color.Air;
  const indx = 0;

  beforeEach(() => {
    const card = new GeneratorCard(color);
    action = new Action(card, indx);
  });

  test("Sans g??n??rateur en main ?? l'index indiqu??", () => {
    game.currentPlayer.hand[indx] = new VirusCard(Color.Joker);
    expect(() => game.checkActionGenerator(action)).toThrow();
  });

  test("G??n??rateur en main mais de la mauvaise couleur", () => {
    game.currentPlayer.hand[indx] = new GeneratorCard(Color.Joker);
    expect(() => game.checkActionGenerator(action)).toThrow();
  });

  test("G??n??rateur en main mais d??j?? pos??", () => {
    game.currentPlayer.hand[indx] = new GeneratorCard(color);

    const slotIndx = game.currentPlayer.getBase(color);
    const slot = game.currentPlayer.base[slotIndx];

    slot.addGenerator(new GeneratorCard(color));

    expect(() => game.checkActionGenerator(action)).toThrow();

    game.currentPlayer.discardBase(slotIndx);
  });

  test("G??n??rateur valide ?? poser", () => {
    game.currentPlayer.hand[indx] = new GeneratorCard(color);
    expect(game.checkActionGenerator(action));
  });
});

describe("checkActionVirus", () => {
  let action: Action;
  const color = Color.Air;
  const indInHand = 0;

  beforeEach(() => {
    const card = new VirusCard(color);
    action = new Action(card, indInHand);
    game.currentPlayer.hand[indInHand] = new VirusCard(color);
  });

  test("Sans virus en main ?? l'index indiqu??", () => {
    game.currentPlayer.hand[indInHand] = new GeneratorCard(Color.Joker);
    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Virus en main mais de la mauvaise couleur", () => {
    game.currentPlayer.hand[indInHand] = new VirusCard(Color.Joker);
    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Cible non sp??cifi??e et G??n??rateur cible non sp??cifi??", () => {
    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Cible du virus non sp??cifi??", () => {
    action.addSlotTarget(0);
    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("G??n??rateur cible non sp??cifi??", () => {
    action.addTarget(targetPlayer);
    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Attaque d'un g??n??rateur sain joker", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(Color.Joker);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Joker));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque d'un g??n??rateur sain de m??me couleur", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque d'un g??n??rateur sain de couleur incompatible", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(Color.Water);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Attaque avec un virus joker d'un g??n??rateur sain", () => {
    game.currentPlayer.hand[indInHand].color = Color.Joker;
    action.card.color = Color.Joker;

    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque avec un virus joker d'un g??n??rateur infect??", () => {
    game.currentPlayer.hand[indInHand].color = Color.Joker;
    action.card.color = Color.Joker;

    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addVirus(new VirusCard(color));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque avec un virus joker d'un g??n??rateur prot??g??", () => {
    game.currentPlayer.hand[indInHand].color = Color.Joker;
    action.card.color = Color.Joker;

    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(color));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque d'un parefeu joker sur g??n??rateur prot??g?? incompatible", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(Color.Water);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Joker));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque d'un parefeu joker sur g??n??rateur prot??g?? compatible", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(Color.Joker));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque d'un parefeu non joker sur g??n??rateur prot??g?? incompatible", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(Color.Water);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Water));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Attaque d'un parefeu non joker sur g??n??rateur prot??g?? compatible", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(color));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque d'un g??n??rateur infect?? compatible", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addVirus(new VirusCard(color));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(game.checkActionVirus(action));
  });

  test("Attaque d'un g??n??rateur infect?? incompatible", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(Color.Water);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));
    targetSlot.addVirus(new VirusCard(Color.Joker));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Attaque sur g??n??rateur compatible immunis??", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(color));
    targetSlot.addFireWall(new FirewallCard(color));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Attaque sur g??n??rateur incompatible immunis??", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(Color.Water);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Water));

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Attaque sur g??n??rateur compatible vide", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(color);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(() => game.checkActionVirus(action)).toThrow();
  });

  test("Attaque sur g??n??rateur incompatible vide", () => {
    const indTargetSlot = game.players[targetPlayer].getBase(Color.Water);
    const targetSlot = game.players[targetPlayer].base[indTargetSlot];

    action.addSlotTarget(indTargetSlot);
    action.addTarget(targetPlayer);

    expect(() => game.checkActionVirus(action)).toThrow();
  });
});

describe("checkActionFirewall", () => {
  let action: Action;
  const color = Color.Air;
  const indInHand = 0;

  beforeEach(() => {
    const card = new FirewallCard(color);
    action = new Action(card, indInHand);
    game.currentPlayer.hand[indInHand] = new FirewallCard(color);
  });

  test("Sans firewall en main ?? l'index indiqu??", () => {
    game.currentPlayer.hand[indInHand] = new GeneratorCard(Color.Joker);
    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Firewall en main mais de la mauvaise couleur", () => {
    game.currentPlayer.hand[indInHand] = new FirewallCard(Color.Joker);
    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("G??n??rateur cible non sp??cifi??", () => {
    action.addTarget(targetPlayer);
    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Protection d'un g??n??rateur sain joker", () => {
    const indTargetSlot = game.currentPlayer.getBase(Color.Joker);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Joker));

    action.addSlotTarget(indTargetSlot);

    expect(game.checkActionFirewall(action));
  });

  test("Protection d'un g??n??rateur sain de m??me couleur", () => {
    const indTargetSlot = game.currentPlayer.getBase(color);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));

    action.addSlotTarget(indTargetSlot);

    expect(game.checkActionFirewall(action));
  });

  test("Protection avec un firewall joker d'un g??n??rateur sain", () => {
    game.currentPlayer.hand[indInHand].color = Color.Joker;
    action.card.color = Color.Joker;

    const indTargetSlot = game.currentPlayer.getBase(color);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));

    action.addSlotTarget(indTargetSlot);

    expect(game.checkActionFirewall(action));
  });

  test("Protection avec un firewall joker d'un g??n??rateur infect??", () => {
    game.currentPlayer.hand[indInHand].color = Color.Joker;
    action.card.color = Color.Joker;

    const indTargetSlot = game.currentPlayer.getBase(color);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(color));

    action.addSlotTarget(indTargetSlot);

    expect(game.checkActionFirewall(action));
  });

  test("Protection avec un firewall joker d'un g??n??rateur prot??g??", () => {
    game.currentPlayer.hand[indInHand].color = Color.Joker;
    action.card.color = Color.Joker;

    const indTargetSlot = game.currentPlayer.getBase(color);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(color));

    action.addSlotTarget(indTargetSlot);

    expect(game.checkActionFirewall(action));
  });

  test("Protection d'un g??n??rateur sain de couleur incompatible", () => {
    const indTargetSlot = game.currentPlayer.getBase(Color.Water);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));

    action.addSlotTarget(indTargetSlot);

    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Protection d'un parefeu joker sur g??n??rateur prot??g?? incompatible", () => {
    const indTargetSlot = game.currentPlayer.getBase(Color.Water);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Joker));

    action.addSlotTarget(indTargetSlot);

    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Protection d'un parefeu joker sur g??n??rateur prot??g?? compatible", () => {
    const indTargetSlot = game.currentPlayer.getBase(color);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(Color.Joker));

    action.addSlotTarget(indTargetSlot);

    expect(game.checkActionFirewall(action));
  });

  test("Protection d'un parefeu non joker sur g??n??rateur prot??g?? incompatible", () => {
    const indTargetSlot = game.currentPlayer.getBase(Color.Water);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Water));

    action.addSlotTarget(indTargetSlot);

    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Protection d'un parefeu non joker sur g??n??rateur prot??g?? compatible", () => {
    const indTargetSlot = game.currentPlayer.getBase(color);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(color));

    action.addSlotTarget(indTargetSlot);

    expect(game.checkActionFirewall(action));
  });

  test("Protection d'un g??n??rateur infect?? compatible", () => {
    const indTargetSlot = game.currentPlayer.getBase(color);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(color));

    action.addSlotTarget(indTargetSlot);

    expect(game.checkActionFirewall(action));
  });

  test("Protection d'un g??n??rateur infect?? incompatible", () => {
    const indTargetSlot = game.currentPlayer.getBase(Color.Water);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Joker));

    action.addSlotTarget(indTargetSlot);

    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Protection sur g??n??rateur compatible immunis??", () => {
    const indTargetSlot = game.currentPlayer.getBase(color);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(color));
    targetSlot.addFireWall(new FirewallCard(color));
    targetSlot.addFireWall(new FirewallCard(color));

    action.addSlotTarget(indTargetSlot);

    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Protection sur g??n??rateur incompatible immunis??", () => {
    const indTargetSlot = game.currentPlayer.getBase(Color.Water);
    const targetSlot = game.currentPlayer.base[indTargetSlot];
    targetSlot.addGenerator(new GeneratorCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Water));
    targetSlot.addFireWall(new FirewallCard(Color.Water));

    action.addSlotTarget(indTargetSlot);

    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Protection sur g??n??rateur compatible vide", () => {
    const indTargetSlot = game.currentPlayer.getBase(color);

    action.addSlotTarget(indTargetSlot);

    expect(() => game.checkActionFirewall(action)).toThrow();
  });

  test("Protection sur g??n??rateur incompatible vide", () => {
    const indTargetSlot = game.currentPlayer.getBase(Color.Water);

    action.addSlotTarget(indTargetSlot);

    expect(() => game.checkActionFirewall(action)).toThrow();
  });
});

describe("checkActionSpe", () => {
  let action: Action;
  const color = Color.Air;
  const indInHand = 0;

  beforeEach(() => {
    const card = new VirusCard(color);
    action = new Action(card, indInHand);
    game.currentPlayer.hand[indInHand] = new SpecialCard(color);
  });

  test("Sans action en main ?? l'index indiqu??", () => {
    game.currentPlayer.hand[indInHand] = new VirusCard(Color.Joker);
    expect(() => game.checkActionSpe(action)).toThrow();
  });

  test("Action en main mais pas la bonne", () => {
    game.currentPlayer.hand[indInHand] = new SpecialCard(Color.Joker);
    expect(() => game.checkActionSpe(action)).toThrow();
  });

  describe("Nuclear distraction", () => {
    test("Action en main", () => {
      expect(game.checkActionSpe(action));
    });
  });

  describe("ID theft", () => {
    const color = Color.Water;

    beforeEach(() => {
      action.card.color = color;
      game.currentPlayer.hand[indInHand] = new SpecialCard(color);
    });

    test("Action en main sans cible", () => {
      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Action en main avec cible d??finie", () => {
      action.addTarget(targetPlayer);
      expect(game.checkActionSpe(action));
    });
  });

  describe("Loan", () => {
    const color = Color.Radiation;
    let slotTargetInd = 0;

    beforeEach(() => {
      action.card.color = color;
      game.currentPlayer.hand[indInHand] = new SpecialCard(color);
    });

    test("Action en main sans cible", () => {
      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Action en main avec cible d??finie mais pas de slot", () => {
      action.addTarget(targetPlayer);
      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Action en main avec slot d??fini mais pas de cible joueur", () => {
      action.addSlotTarget(slotTargetInd);
      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Emprunt d'un slot vide", () => {
      action.addTarget(targetPlayer);
      action.addSlotTarget(slotTargetInd);

      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Emprunt d'un slot avec un g??n??rateur sain", () => {
      slotTargetInd = game.players[targetPlayer].getBase(color);
      const slotTarget = game.players[targetPlayer].base[slotTargetInd];

      slotTarget.addGenerator(new GeneratorCard(color));
      action.addSlotTarget(slotTargetInd);
      action.addTarget(targetPlayer);

      expect(game.checkActionSpe(action));
    });

    test("Emprunt d'un slot avec un g??n??rateur contamin??", () => {
      slotTargetInd = game.players[targetPlayer].getBase(color);
      const slotTarget = game.players[targetPlayer].base[slotTargetInd];

      slotTarget.addGenerator(new GeneratorCard(color));
      slotTarget.addVirus(new VirusCard(color));

      action.addSlotTarget(slotTargetInd);
      action.addTarget(targetPlayer);

      expect(game.checkActionSpe(action));
    });

    test("Emprunt d'un slot avec un g??n??rateur prot??g??", () => {
      slotTargetInd = game.players[targetPlayer].getBase(color);
      const slotTarget = game.players[targetPlayer].base[slotTargetInd];

      slotTarget.addGenerator(new GeneratorCard(color));
      slotTarget.addFireWall(new FirewallCard(color));

      action.addSlotTarget(slotTargetInd);
      action.addTarget(targetPlayer);

      expect(game.checkActionSpe(action));
    });

    test("Emprunt d'un slot avec un g??n??rateur immunis??", () => {
      slotTargetInd = game.players[targetPlayer].getBase(color);
      const slotTarget = game.players[targetPlayer].base[slotTargetInd];

      slotTarget.addGenerator(new GeneratorCard(color));
      slotTarget.addFireWall(new FirewallCard(color));
      slotTarget.addFireWall(new FirewallCard(color));

      action.addSlotTarget(slotTargetInd);
      action.addTarget(targetPlayer);

      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Emprunt cr??ant un doublon", () => {
      slotTargetInd = game.players[targetPlayer].getBase(color);
      let slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(color));
      action.addSlotTarget(slotTargetInd);
      action.addTarget(targetPlayer);

      slotTargetInd = game.currentPlayer.getBase(color);
      slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(color));

      expect(() => game.checkActionSpe(action)).toThrow();
    });
  });

  describe("Exchange", () => {
    const color = Color.Energy;

    beforeEach(() => {
      action.card.color = color;
      game.currentPlayer.hand[indInHand] = new SpecialCard(color);
    });

    test("Action en main sans cible", () => {
      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Action en main avec cibles d??finie mais pas de slot", () => {
      action.addTarget(targetPlayer);
      action.addTarget(game.currentPlayerIdx);
      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Action en main avec slot d??fini mais pas de cible joueur", () => {
      action.addSlotTarget(0);
      action.addSlotTarget(0);
      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Echange entre deux g??n??rateurs sains", () => {
      action.addTarget(targetPlayer);
      action.addTarget(game.currentPlayerIdx);

      let slotTargetInd = game.currentPlayer.getBase(color);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(color));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.players[targetPlayer].getBase(color);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(color));
      action.addSlotTarget(slotTargetInd);

      expect(game.checkActionSpe(action));
    });
    test("Echange comportant un g??n??rateurs immunis??", () => {
      action.addTarget(targetPlayer);
      action.addTarget(game.currentPlayerIdx);

      let slotTargetInd = game.currentPlayer.getBase(color);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(color));
      slotTarget.addFireWall(new FirewallCard(color));
      slotTarget.addFireWall(new FirewallCard(color));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.players[targetPlayer].getBase(color);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(color));
      action.addSlotTarget(slotTargetInd);

      expect(() => game.checkActionSpe(action)).toThrow();
    });
    test("Echange comportant un slot vide", () => {
      action.addTarget(targetPlayer);
      action.addTarget(game.currentPlayerIdx);

      let slotTargetInd = game.currentPlayer.getBase(color);
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.players[targetPlayer].getBase(color);
      const slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(color));
      action.addSlotTarget(slotTargetInd);

      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Echange cr??ant un doublon de deux g??n??rateur chez un joueur", () => {
      action.addTarget(targetPlayer);
      action.addTarget(game.currentPlayerIdx);

      let slotTargetInd = game.currentPlayer.getBase(Color.Air);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.currentPlayer.getBase(Color.Water);
      slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Water));

      slotTargetInd = game.players[targetPlayer].getBase(Color.Water);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Water));
      action.addSlotTarget(slotTargetInd);

      expect(() => game.checkActionSpe(action)).toThrow();
    });
  });

  describe("Cleaning", () => {
    const color = Color.Joker;

    beforeEach(() => {
      action.card.color = color;
      game.currentPlayer.hand[indInHand] = new SpecialCard(color);
    });

    test("Action en main sans cible", () => {
      expect(game.checkActionSpe(action));
    });

    test("Action en main avec cible d??finie mais pas de slot", () => {
      action.addTarget(targetPlayer);
      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("La cible est le joueur actuel", () => {
      action.addTarget(targetPlayer);

      let slotTargetInd = game.currentPlayer.getBase(Color.Air);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));
      slotTarget.addVirus(new VirusCard(Color.Air));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.currentPlayer.getBase(Color.Joker);
      slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Joker));
      action.addSlotTarget(slotTargetInd);

      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Le g??n??rateur source n'est pas contamin??", () => {
      action.addTarget(targetPlayer);

      let slotTargetInd = game.currentPlayer.getBase(Color.Air);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.players[targetPlayer].getBase(Color.Joker);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Joker));
      action.addSlotTarget(slotTargetInd);

      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Le g??n??rateur destination n'est pas sain", () => {
      action.addTarget(targetPlayer);

      let slotTargetInd = game.currentPlayer.getBase(Color.Air);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.players[targetPlayer].getBase(Color.Joker);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Joker));
      slotTarget.addVirus(new VirusCard(Color.Joker));
      action.addSlotTarget(slotTargetInd);

      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("G??n??rateur destination incompatible avec le virus", () => {
      action.addTarget(targetPlayer);

      let slotTargetInd = game.currentPlayer.getBase(Color.Air);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));
      slotTarget.addVirus(new VirusCard(Color.Air));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.players[targetPlayer].getBase(Color.Water);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Water));
      action.addSlotTarget(slotTargetInd);

      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Cleaning non total des candidats de d??part au nettoyage", () => {
      let slotTargetInd = game.currentPlayer.getBase(Color.Air);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));
      slotTarget.addVirus(new VirusCard(Color.Air));

      slotTargetInd = game.players[targetPlayer].getBase(Color.Air);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));

      expect(() => game.checkActionSpe(action)).toThrow();
    });

    test("Un cleaning correct d'un virus", () => {
      action.addTarget(targetPlayer);

      let slotTargetInd = game.currentPlayer.getBase(Color.Air);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Joker));
      slotTarget.addVirus(new VirusCard(Color.Air));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.players[targetPlayer].getBase(Color.Air);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));
      action.addSlotTarget(slotTargetInd);
      expect(game.checkActionSpe(action));
    });

    test("Un cleaning correct d'un seul virus avec deux candidats au d??part", () => {
      action.addTarget(targetPlayer);

      let slotTargetInd = game.currentPlayer.getBase(Color.Air);
      let slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Air));
      slotTarget.addVirus(new VirusCard(Color.Air));
      action.addSlotTarget(slotTargetInd);

      slotTargetInd = game.currentPlayer.getBase(Color.Water);
      slotTarget = game.currentPlayer.base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Water));
      slotTarget.addVirus(new VirusCard(Color.Water));

      slotTargetInd = game.players[targetPlayer].getBase(Color.Joker);
      slotTarget = game.players[targetPlayer].base[slotTargetInd];
      slotTarget.addGenerator(new GeneratorCard(Color.Joker));
      action.addSlotTarget(slotTargetInd);

      expect(game.checkActionSpe(action));
    });
  });
});
