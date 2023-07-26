import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { Player, Player__factory, Team__factory, Team, Session__factory, Session } from "../typechain-types";

describe("Player Contract", function () {
  let playerContract: Player;
  let teamContract: Team;
  let sessionContract: Session;
  let owner: Signer;
  let player1: Signer;
  let player2: Signer;
  let fakeSessionContract: Signer;
  let sessionContractAddress: string;

  beforeEach(async function () {
    const PlayerFactory: Player__factory = await ethers.getContractFactory("Player");
    const TeamFactory: Team__factory = await ethers.getContractFactory("Team");
    const SessionFactory: Session__factory = await ethers.getContractFactory("Session");
    [owner, player1, player2, fakeSessionContract] = await ethers.getSigners();

    teamContract = await TeamFactory.deploy();
    await teamContract.waitForDeployment();

    sessionContract = await SessionFactory.deploy();
    await sessionContract.waitForDeployment();

    playerContract = await PlayerFactory.deploy(await teamContract.getAddress());
    await playerContract.waitForDeployment();

    sessionContractAddress = await fakeSessionContract.getAddress();
  });

  describe("Register Player", function () {
    const firstName = "John";
    const lastName = "Doe";
    const image = "image.png";
    const description = "Player description";
    let playerAddress: string;

    beforeEach(async function () {
      playerAddress = await player1.getAddress();
      await playerContract.connect(player1).registerPlayer(firstName, lastName, image, description);
    });

    it("Should set the correct player data", async function () {
      const playerData = await playerContract.players(playerAddress);
      expect(playerData.firstName).to.equal(firstName);
      expect(playerData.lastName).to.equal(lastName);
      expect(playerData.image).to.equal(image);
      expect(playerData.description).to.equal(description);
      expect(playerData.character.isAlive).to.equal(true);
    });
  });

  describe("Join Team", function () {
    it("Should set the correct teamId", async function () {
      await teamContract.connect(owner).createTeam("Team 1", "Image", "Description", sessionContract.getAddress());
      const playerAddress = await player1.getAddress();
      await playerContract.connect(player1).joinTeam(1);
      const playerData = await playerContract.players(playerAddress);
      expect(playerData.teamId).to.equal(1);
    });
  });

  describe("Check Session Availability", function () {
    it("Should return session availability", async function () {
      await teamContract.connect(owner).createTeam("Team 1", "Image", "Description", sessionContract.getAddress());
      const isSessionAvailable = await playerContract.connect(player1).checkSessionAvailability(1);
      expect(isSessionAvailable).to.equal(true);
    });
  });
});
