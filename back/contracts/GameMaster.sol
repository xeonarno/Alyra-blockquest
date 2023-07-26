// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;

import "./Team.sol";

contract GameMaster {
    struct GM {
        string name;
        string surname;
        string imageUri;
        string biography;
        address gmAddress;
    }

    mapping(address => GM) public gameMasters;
    Team public teamContract;

    event GMRegistered(address gmAddress);

    constructor(address _teamContractAddress) {
        teamContract = Team(_teamContractAddress);
    }

    modifier onlyGM() {
        require(
            gameMasters[msg.sender].gmAddress != address(0),
            "Only a registered Game Master can perform this action"
        );
        _;
    }

    function createGM(
        string memory name,
        string memory surname,
        string memory imageUri,
        string memory biography
    ) external {
        gameMasters[msg.sender] = GM(
            name,
            surname,
            imageUri,
            biography,
            msg.sender
        );
        emit GMRegistered(msg.sender);
    }

    function createTeam(
        string memory _name,
        string memory image,
        string memory _desc
    ) external onlyGM  returns (uint256){
        return teamContract.createTeam(_name, image, _desc);
    }

    function deleteTeam(uint256 teamId) external onlyGM {
        teamContract.deleteTeam(teamId);
    }

    function startGame(uint256 teamId, uint256 amount) external onlyGM {
        teamContract.createSession(teamId, amount);
    }

    function endGame(uint256 teamId) external onlyGM {
        teamContract.endSession(teamId);
    }
}