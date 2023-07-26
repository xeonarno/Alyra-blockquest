import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { Team, Team__factory } from "../typechain-types";

describe("Team", () => {
    let team: Team;
    let owner: Signer;
    let addr1: Signer;
    let addr2: Signer;
    let addr3: Signer;
    let otherAddrs: Signer[];

    beforeEach(async () => {
        const TeamFactory = await ethers.getContractFactory("Team") as Team__factory;
        [owner, addr1, addr2, addr3, ...otherAddrs] = await ethers.getSigners();

        team = await TeamFactory.deploy(otherAddrs[0],otherAddrs[1]) as Team;
        team.waitForDeployment();
        await team.waitForDeployment();
    });

    it("Should not let a non-owner create more than MAX_TEAM_PER_GM teams", async () => {
        for(let i=0; i<10; i++){
            await team.connect(owner).createTeam(`team${i+1}`, "imageURI", "desc");
        }

        await expect(team.connect(owner).createTeam("team11", "imageURI", "desc")).to.be.revertedWith("GM has too many teams");
    });

    it("Should not let a player join a full team", async () => {
        await team.connect(owner).createTeam("team1", "imageURI", "desc");

        // Join the maximum number of players to the team
        for(let i = 0; i < 7; i++){
            await team.connect(otherAddrs[i]).joinTeam(0);
        }

        // Try to join one more player
        await expect(team.connect(addr1).joinTeam(0)).to.be.revertedWith("Team is full");
    });

    it("Should not let a player join a team they're already in", async () => {
        await team.connect(owner).createTeam("team1", "imageURI", "desc");
        await team.connect(addr1).joinTeam(0);

        await expect(team.connect(addr1).joinTeam(0)).to.be.revertedWith("Player already in this team");
    });

    it("Should not let a player leave a team they're not in", async () => {
        await team.connect(owner).createTeam("team1", "imageURI", "desc");

        await expect(team.connect(addr1).leaveTeam(0)).to.be.revertedWith("Player not in this team");
    });

    it("Should not let a non-GM delete a team", async () => {
        await team.connect(owner).createTeam("team1", "imageURI", "desc");

        await expect(team.connect(addr1).deleteTeam(0)).to.be.revertedWith("Only GM can delete the team");
    });

});
