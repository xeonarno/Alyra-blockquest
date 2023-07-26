import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { Session, Session__factory } from "../typechain-types";

describe("Session", () => {
    let session: Session;
    let gameMaster: Signer;
    let player1: Signer;
    let player2: Signer;
    let player3: Signer;
    let otherAddrs: Signer[];

    beforeEach(async () => {
        const SessionFactory = await ethers.getContractFactory("Session") as Session__factory;
        [gameMaster, player1, player2, player3, ...otherAddrs] = await ethers.getSigners();

        const gameMasterAddress = await gameMaster.getAddress();
        const player1Address = await player1.getAddress();
        const player2Address = await player2.getAddress();
        const player3Address = await player3.getAddress();

        const addresses = [player1Address, player2Address, player3Address];
        session = await SessionFactory.deploy(gameMasterAddress, addresses, ethers.parseEther("1"));
        await session.waitForDeployment();
    });

    it("Should allow player to roll dice", async () => {
        await session.connect(player1).payFee({ value: ethers.parseEther("1") });
        await session.connect(player1).rollDice(6);
    });

    it("Should allow game master to roll dice", async () => {
        await session.connect(gameMaster).rollDice(6);
    });

    it("Should allow game master to add a monster", async () => {
        await session.connect(gameMaster).addMonster("Dragon", 5, 10, 100, 50, 1000);
        expect(await session.getMonsterCount()).to.equal(1);
    });

    it("Should allow game master to remove a monster", async () => {
        await session.connect(gameMaster).addMonster("Dragon", 5, 10, 100, 50, 1000);
        await session.connect(gameMaster).removeMonster(0);
        expect(await session.getMonsterCount()).to.equal(0);
    });

    it("Should count monsters killed", async () => {
        await session.connect(gameMaster).addMonster("Dragon", 5, 10, 100, 50, 1000);
        await session.connect(gameMaster).killMonster(0);
        expect(await session.getMonstersKilled()).to.equal(1);
    });

    it("Should count total gold obtained", async () => {
        await session.connect(gameMaster).addMonster("Dragon", 5, 10, 100, 50, 1000);
        await session.connect(gameMaster).killMonster(0);
        expect(await session.getTotalGold()).to.equal(1000);
    });

    it("Should calculate total playing time", async () => {
        // Assume the session was started at the time of contract creation.
        const startTime = await session.getStartTime();
        // Assume the session ends now.
        await session.connect(gameMaster).endSession();
        const endTime = await session.getEndTime();
        const expectedDuration = endTime - startTime;
        expect(await session.getTotalPlayTime()).to.equal(expectedDuration);
    });



    it("Should allow player to pay session fee", async () => {
        await session.connect(player1).payFee({ value: ethers.parseEther("1") });
        const player1Address = await player1.getAddress();
        expect(await session.isActivePlayer(player1Address)).to.be.true;
    });


    it("Should allow active player to send a message", async () => {
        await session.connect(player1).payFee({ value: ethers.parseEther("1") });
        await session.connect(player1).sendMessage("Hello");
        const player1Address = await player1.getAddress();
        expect(await session.isActivePlayer(player1Address)).to.be.true;
    });

    it("Should not allow non-player to pay session fee", async () => {
        await expect(session.connect(otherAddrs[0]).payFee({ value: ethers.parseEther("1") }))
            .to.be.revertedWith("Only players can perform this action");

    });

    it("Should not allow player to pay session fee more than once", async () => {
        await session.connect(player1).payFee({ value: ethers.parseEther("1") });
        await expect(session.connect(player1).payFee({ value: ethers.parseEther("1") }))
            .to.be.revertedWith("Player has already paid");

    });

    it("Should allow active player to send a message", async () => {
        await session.connect(player1).payFee({ value: ethers.parseEther("1") });
        await session.connect(player1).sendMessage("Hello");
    });

    it("Should not allow non-active player to send a message", async () => {
        await expect(session.connect(player1).sendMessage("Hello"))
            .to.be.revertedWith("Only active players or Game Master can perform this action");

    });

    it("Should allow game master to end session", async () => {
        await session.connect(gameMaster).endSession();
        expect(await session.isActive()).to.be.false;
    });

    it("Should not allow non-game master to end session", async () => {
        await expect(session.connect(player1).endSession())
            .to.be.revertedWith("Only the game master can perform this action");
    });

    it("Should not allow game master to end session that has already ended", async () => {

        await session.connect(player1).payFee({ value: ethers.parseEther("1") });

        await session.connect(gameMaster).endSession();

        await expect(session.connect(gameMaster).endSession())
            .to.be.revertedWith("Session has been ended");
    });

    it("Should allow game master to kill a monster", async () => {
        await session.connect(gameMaster).addMonster("Dragon", 5, 10, 100, 50, 1000);
        await session.connect(gameMaster).killMonster(0);

        expect(await session.getMonstersKilled()).to.equal(1);
        expect(await session.getTotalGold()).to.equal(1000);
        expect(await session.getMonsterCount()).to.equal(0);
    });

    it("Should not allow game master to kill a non-existent monster", async () => {
        await expect(session.connect(gameMaster).killMonster(0))
            .to.be.revertedWith("Monster does not exist");
    });

    it("Should not allow game master to remove a non-existent monster", async () => {
        await expect(session.connect(gameMaster).removeMonster(0))
            .to.be.revertedWith("Monster does not exist");
    });

    it("Should allow game master to end session if session has funds", async () => {
        await session.connect(player1).payFee({ value: ethers.parseEther("1") });
        await session.connect(gameMaster).endSession();
        expect(await session.isActive()).to.be.false;
    });

    it("Should get paid players", async () => {
        await session.connect(player1).payFee({ value: ethers.parseEther("1") });
        await session.connect(player2).payFee({ value: ethers.parseEther("1") });
        
        const player1Address = await player1.getAddress();
        const player2Address = await player2.getAddress();

        let paidPlayers = await session.getPaidPlayers();
        // Assuming that the getPaidPlayers function returns a sorted list
        expect(paidPlayers[0]).to.equal(player1Address);
        expect(paidPlayers[1]).to.equal(player2Address);
    });

});
