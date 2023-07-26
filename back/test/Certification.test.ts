import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { Certification, Certification__factory } from "../typechain-types";

describe("Certification Contract", function () {
  let certification: Certification;
  let owner: Signer;
  let fakeSessionContract: Signer;
  let player: Signer;
  let team: Signer;
  let sessionContractAddress: string;
  let emptyPlayer: Signer;

  beforeEach(async function () {

    const SessionFactory = await ethers.getContractFactory("Session");
    const session = await SessionFactory.deploy(/* arguments to the constructor, if any */);
    await session.waitForDeployment();
    const sessionContractAddress = await session.getAddress();

    const CertificationFactory: Certification__factory = await ethers.getContractFactory("Certification");
    [owner, player, team, emptyPlayer] = await ethers.getSigners();
    certification = await CertificationFactory.deploy(sessionContractAddress);
    await certification.waitForDeployment();

    // Mint a diploma for the player before each test
    await certification.connect(owner).mintDiploma(await player.getAddress(), await team.getAddress(), "3600");
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await certification.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the session contract address", async function () {
      expect(await certification.sessionContractAddress()).to.equal(sessionContractAddress);
    });
  });

  describe("Minting Diploma", function () {
    const date = "2023-07-18";
    let playerAddress: string;
    let teamAddress: string;
    let newItemId: bigint;

    beforeEach(async function () {
      playerAddress = await player.getAddress();
      teamAddress = await team.getAddress();
      const tx = await certification.connect(fakeSessionContract).mintDiploma(
        playerAddress,
        teamAddress,
        date
      );
      await tx.wait();
      newItemId = await certification.tokenOfOwnerByIndex(playerAddress, 0);
    });

    it("Should increment the tokenId", async function () {
      expect(await certification.tokenOfOwnerByIndex(playerAddress, 0)).to.equal(newItemId);
    });

    it("Should set the correct diploma data", async function () {
      const diploma = await certification.getDiploma(newItemId);
      expect(diploma.playerAddress).to.equal(playerAddress);
      expect(diploma.teamAddress).to.equal(teamAddress);
      expect(diploma.date).to.equal(date);
    });
  });

  describe("Get All Diplomas Of Player", function () {
    it("Should return all diplomas of a player", async function () {
      const diplomas = await certification.connect(player).getAllDiplomasOfPlayer();
      expect(diplomas).to.include(0);
    });
  });

  describe("Get Certificate URI", function () {
    it("Should return a valid URI", async function () {
      const tokenURI = await certification.getCertificateURI(player.getAddress(), 0);
      expect(tokenURI).to.match(/^data:application\/json;base64,.+/);
    });
  });

  describe("Get All Certificates Of Player", function () {
    it("Should return all certificates of a player", async function () {
      const certificates = await certification.connect(player).getAllCertificatesOfPlayer();
      expect(certificates.length).to.equal(1);
    });
  });

  it("Should throw an error if the player has no diplomas", async function () {
    await expect(certification.getAllDiplomasOfPlayer()).to.be.revertedWith('Player does not have any certificates');
});
});
