// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

struct Monster {
    string name;
    uint256 gold;
    uint8 level;
    uint8 hitPoints;
    uint8 damage;
    uint8 experience;
}
struct Message {
    address sender;
    string content;
}

contract Session {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct Game {
        uint256 teamId;
        address gm;
        EnumerableSet.AddressSet players;
        EnumerableSet.AddressSet activePlayers;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPlayTime;
        Counters.Counter monstersKilled;
        uint256 totalGold;
        Message[] messages;
        Monster[] monsters;
        bool active;
    }

    mapping(uint256 => Game) games;

    event SessionCreated(uint256 teamId, address gameMaster);
    event PlayerJoined(uint256 indexed teamId, address indexed playerAddress);
    event PlayerLeft(uint256 indexed teamId, address indexed playerAddress);

    event MonsterAdded(
        uint256 indexed teamId,
        uint256 indexed monsterId,
        string monsterType,
        uint8 strength
    );
    event MonsterKilled(uint256 indexed teamId, string name, uint256 gold);
    event MonsterRemoved(uint256 indexed teamId, uint256 indexed monsterId);
    event MessageSent(uint256 indexed teamId, address sender, string content);
    event DiceRoll(uint256 indexed teamId, address roller, uint8 result);

    function createSession(
        uint256 teamId,
        address gameMasterAddress,
        address[] memory playerAddresses,
        uint256 feeAmount
    ) public returns (uint256) {
        games[teamId].gm = gameMasterAddress;
        for (uint i = 0; i < playerAddresses.length; i++) {
            games[teamId].players.add(playerAddresses[i]);
        }

        games[teamId].amount = feeAmount;
        games[teamId].startTime = block.timestamp;
        games[teamId].active = true;
        games[teamId].teamId = teamId;

        emit SessionCreated(teamId, msg.sender);
        return teamId;
    }

    modifier isActiveSession(uint256 teamId) {
        require(games[teamId].active, "Session has been ended");
        _;
    }

    modifier onlyGameMaster(uint256 teamId) {
        require(
            msg.sender == games[teamId].gm,
            "Only the game master can perform this action"
        );
        _;
    }

    modifier onlyPlayer(uint256 teamId) {
        require(
            games[teamId].players.contains(msg.sender),
            "Only players can perform this action"
        );
        _;
    }

    modifier onlyTeamMembers(uint256 teamId) {
        require(
            games[teamId].activePlayers.contains(msg.sender) ||
                msg.sender == games[teamId].gm,
            "Only active players or Game Master can perform this action"
        );
        _;
    }

    function payFee(
        uint256 teamId
    ) external payable isActiveSession(teamId) {
        require(msg.value >= games[teamId].amount, "Incorrect fee amount");
        require(
            !games[teamId].activePlayers.contains(msg.sender),
            "Player has already paid"
        );
        games[teamId].activePlayers.add(msg.sender);
        emit PlayerJoined(teamId, msg.sender);
    }

    function sendMessage(
        uint256 teamId,
        string memory content
    ) public onlyTeamMembers(teamId) isActiveSession(teamId) {
        Message memory newMessage;
        newMessage.sender = msg.sender;
        newMessage.content = content;
        games[teamId].messages.push(newMessage);
        emit MessageSent(teamId, msg.sender, content);
    }

    function rollDice(
        uint256 teamId,
        uint8 diceSides
    ) external onlyTeamMembers(teamId) isActiveSession(teamId) returns (uint8) {
        uint8 result = uint8((block.timestamp % diceSides) + 1);
        emit DiceRoll(teamId, msg.sender, result);

        string memory content = string(
            abi.encodePacked(
                "Rolled a dice and got ",
                Strings.toString(uint256(result))
            )
        );
        sendMessage(teamId, content);
        return result;
    }

    function addMonster(
        uint256 teamId,
        string memory name,
        uint8 level,
        uint8 hitPoints,
        uint8 damage,
        uint8 experience,
        uint256 gold
    ) external onlyGameMaster(teamId) isActiveSession(teamId) {
        uint monsterIndex = games[teamId].monsters.length;
        Monster memory m = Monster(
            name,
            gold,
            level,
            hitPoints,
            damage,
            experience
        );
        games[teamId].monsters.push(m);
        emit MonsterAdded(teamId, monsterIndex, name, damage);

        string memory content = string(
            abi.encodePacked(
                "Added a monster of type ",
                name,
                " with strength ",
                Strings.toString(uint256(damage))
            )
        );
        sendMessage(teamId, content);
    }

    function killMonster(
        uint256 teamId,
        uint256 monsterIndex
    ) external onlyGameMaster(teamId) isActiveSession(teamId) {
        require(
            monsterIndex < games[teamId].monsters.length,
            "Monster does not exist"
        );
        Monster memory monster = games[teamId].monsters[monsterIndex];

        // only replace with last monster if it's not already the last one
        if (monsterIndex != games[teamId].monsters.length - 1) {
            games[teamId].monsters[monsterIndex] = games[teamId].monsters[
                games[teamId].monsters.length - 1
            ];
        }

        games[teamId].monsters.pop();
        games[teamId].monstersKilled.increment();
        games[teamId].totalGold = games[teamId].totalGold.add(monster.gold);
        emit MonsterKilled(teamId,monster.name, monster.gold);
    }

    function removeMonster(
        uint256 teamId,
        uint256 monsterIndex
    ) external onlyGameMaster(teamId) isActiveSession(teamId) {
        require(
            monsterIndex < games[teamId].monsters.length,
            "Monster does not exist"
        );

        // only replace with last monster if it's not already the last one
        if (monsterIndex != games[teamId].monsters.length - 1) {
            games[teamId].monsters[monsterIndex] = games[teamId].monsters[
                games[teamId].monsters.length - 1
            ];
        }

        games[teamId].monsters.pop();
        emit MonsterRemoved(teamId,monsterIndex);
    }

    function endSession(
        uint256 teamId
    ) external onlyGameMaster(teamId) isActiveSession(teamId) {
        require(address(this).balance >= 0, "Session has no funds");

        games[teamId].active = false;
        games[teamId].endTime = block.timestamp;

        // We get the total amount of gold to be grabed from the active players
        uint value = games[teamId].amount.mul(games[teamId].activePlayers.length());
        (bool success, ) = payable(games[teamId].gm).call{
            value: value
        }("");
        require(success, "Transfer to game master failed");
    }

    function isActivePlayer(
        uint256 teamId,
        address playerAddress
    ) external view returns (bool) {
        return games[teamId].activePlayers.contains(playerAddress);
    }

    function getMonsterCount(uint256 teamId) external view returns (uint256) {
        return games[teamId].monsters.length;
    }

    function getMonstersKilled(uint256 teamId) external view returns (uint256) {
        return games[teamId].monstersKilled.current();
    }

    function getTotalGold(uint256 teamId) external view returns (uint256) {
        return games[teamId].totalGold;
    }

    function getStartTime(uint256 teamId) external view returns (uint256) {
        return games[teamId].startTime;
    }

    function getEndTime(uint256 teamId) external view returns (uint256) {
        return games[teamId].endTime;
    }

    function getTotalPlayTime(uint256 teamId) external view returns (uint256) {
        require(
            games[teamId].endTime >= games[teamId].startTime,
            "Session has not yet ended"
        );
        return games[teamId].endTime.sub(games[teamId].startTime);
    }

    function isActive(uint256 teamId) external view returns (bool) {
        return games[teamId].active;
    }

    function getPlayers (
        uint256 teamId
    ) external view onlyGameMaster(teamId) returns (address[] memory) {
        return games[teamId].players.values();
    }

    function getPaidPlayers(
        uint256 teamId
    ) external view onlyGameMaster(teamId) returns (address[] memory) {
        return games[teamId].activePlayers.values();
    }
}
