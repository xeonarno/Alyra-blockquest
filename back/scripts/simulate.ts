import { ethers } from "hardhat";

async function main() {
    // Get accounts
    const accounts = await ethers.getSigners();


    // Deploy Session contract
    const Session = await ethers.getContractFactory("Session");
    const session = await Session.deploy();
    await session.waitForDeployment();
    console.log("Session contract deployed to:", session.target);

    // Deploy Certification contract
    const Certification = await ethers.getContractFactory("Certification");
    const certification = await Certification.deploy(session.target);
    await certification.waitForDeployment();
    console.log("Certification contract deployed to:", certification.target);

    // Deploy Team contract
    const Team = await ethers.getContractFactory("Team");
    const team = await Team.deploy(session.target, certification.target);
    await team.waitForDeployment();
    console.log("Team contract deployed to:", team.target);

    // Deploy Player contract
    const Player = await ethers.getContractFactory("Player");
    const player = await Player.deploy(team.target);
    await player.waitForDeployment();
    console.log("Player contract deployed to:", player.target);

    // Deploy GameMaster contract
    const GameMaster = await ethers.getContractFactory("GameMaster");
    const gamemaster = await GameMaster.deploy(team.target);
    await gamemaster.waitForDeployment();
    console.log("GameMaster contract deployed to:", gamemaster.target);

    // Simulate game play

    const owner = accounts[0]; // Game master
    const GM = accounts[1];
    const player1 = accounts[2];

    await gamemaster.connect(GM).createGM("John", "Doe", "image_link", "description");

    const response = await gamemaster.connect(GM).createTeam("Team 1", "image_link", "description");
    const receipt = await response.wait();
    const event = team.interface.parseLog(receipt?.logs[0] as any);
    const teamId = event?.args[0];
    console.log({ teamId });
    
    await gamemaster.connect(GM).createTeam("Team 2", "image_link", "description");
    
    // Player1 registers
    await player.connect(player1).registerPlayer("John", "Doe", "image_link", "description");

    // Player1 joins the team
    await player.connect(player1).joinTeam(0);

    // GM starts the session with the team and amount of ether to be paid
    const price = ethers.parseEther('0.0001');
    await gamemaster.connect(GM).startGame(0,price);

    console.log('Game started');

    // Player1 checks session availability
    const isSessionAvailable = await player.connect(player1).checkSessionAvailability(0);
    console.log("Is session available:", isSessionAvailable);

    // Player1 pays and joins the session
    const payment = await session.connect(player1).payFee(0, { value: ethers.parseEther('0.001') });
    await payment.wait();

    // const paids = await session.connect(GM).getPaidPlayers(0);
    //  console.log({ paids });

//     // GM sends a message
//     await team.connect(GM).sendMessage(0, "A monster entered the room!");
    
//     // Player1 sends a message
//     await team.connect(player1).sendMessage(0, "I attack the monster!");

//    // GM sends a message
//    await team.connect(GM).sendMessage(0, "ok make a roll");

//    // player makes a roll
//     await team.connect(player1).rollDice(0,20);

//     // GM sends a message
//     await team.connect(GM).sendMessage(0, "you hit the monster");

//     // Player1 sends a message
//     await team.connect(player1).sendMessage(0, "I attack the monster again!");

//     // GM sends a message
//     await team.connect(GM).sendMessage(0, "ok make a new roll");

//     await team.connect(player1).rollDice(0,20);

//     // GM sends a message
//     await team.connect(GM).sendMessage(0, "the monster is dead");
    

//     // GM ends the session
//     await team.connect(GM).endSession(0);


//     //Player1 gets the certificate
//     const NFT = await certification.connect(player1).getAllCertificatesOfPlayer();
    
//     console.log({NFT});
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
