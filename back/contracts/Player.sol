// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./Team.sol";
import "./Session.sol";

contract Player is IERC721Receiver {
    using SafeMath for uint256;
    using SafeMath for uint8;

    struct Character {
        string characterType;
        string characterClass;
        uint8 initiative;
        uint8 strength;
        uint8 defense;
        uint8 intelligence;
        uint8 magic;
        uint8 healthPoints;
        bool isAlive;
    }

    struct PlayerInfo {
        string firstName;
        string lastName;
        string image;
        string description;
        address playerAddress;
        Character character;
        uint256 teamId;
    }

    mapping(address => PlayerInfo) public players;
    Team teamContract;

    string[] characterTypes = ["Elf", "Dwarf", "Human"];
    string[] characterClasses = [
        "Hunter",
        "Thief",
        "Barbarian",
        "Healer",
        "Prophet",
        "Beard",
        "Archer"
    ];

    // Event declarations
    event PlayerRegistered(address player);
    event TeamJoined(address player, uint256 teamId);
    event SessionJoined(address player, uint256 teamId);
    event MessageSent(address player, string message);
    event DiceRolled(address player, uint8 result);
    event PlayerDied(address player);
    event DamageReceived(address player, uint8 damage);

    constructor(Team _teamContract) {
        teamContract = _teamContract;
    }

    modifier isSessionActive(uint256 teamId) {
        require(
            teamContract.isSessionActive(teamId),
            "Session is not available"
        );
        _;
    }

    function registerPlayer(
        string memory firstName,
        string memory lastName,
        string memory image,
        string memory description
    ) public {
        require(
            bytes(players[msg.sender].firstName).length == 0,
            "Player already registered"
        );
        require(bytes(firstName).length > 0, "First name is required");
        require(bytes(lastName).length > 0, "Last name is required");
        require(bytes(image).length > 0, "Image is required");
        require(bytes(description).length > 0, "Description is required");
        require(bytes(description).length <= 256, "Description is too long");

        string memory randomCharacterType = characterTypes[
            getRandomNumber(characterTypes.length)
        ];
        string memory randomCharacterClass = characterClasses[
            getRandomNumber(characterClasses.length)
        ];
        uint8 randomInitiative = uint8(getRandomNumber(11) + 10);
        uint8 randomStrength = uint8(getRandomNumber(11) + 10);
        uint8 randomDefense = uint8(getRandomNumber(11) + 10);
        uint8 randomIntelligence = uint8(getRandomNumber(11) + 10);
        uint8 randomMagic = uint8(getRandomNumber(11) + 10);

        players[msg.sender] = PlayerInfo(
            firstName,
            lastName,
            image,
            description,
            msg.sender,
            Character(
                randomCharacterType,
                randomCharacterClass,
                randomInitiative,
                randomStrength,
                randomDefense,
                randomIntelligence,
                randomMagic,
                20,
                true
            ),
            0
        );
    }

    function getRandomNumber(uint256 max) internal view returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(block.timestamp, block.prevrandao))
            ) % max;
    }

    function joinTeam(uint256 teamId) external {
        require(players[msg.sender].character.isAlive, "Player is not alive");
        teamContract.joinTeam(teamId);
        players[msg.sender].teamId = teamId;

        emit TeamJoined(msg.sender, teamId);
    }

    function checkSessionAvailability(
        uint256 teamId
    ) external view returns (bool) {
        return teamContract.isSessionActive(teamId);
    }


    // Function needed to be able to receive NFTs
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function getPlayerLastName(address _playerAddress) public view returns (string memory) {
        return players[_playerAddress].lastName;
    }

    function getPlayerFirstName(address _playerAddress) public view returns (string memory) {
        return players[_playerAddress].firstName;
    }

    function getPlayerAddress(address _playerAddress) public view returns (address) {
        return players[_playerAddress].playerAddress;
    }
}
