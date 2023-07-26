// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Session.sol";
import "./Certification.sol";

contract Team is Ownable {
    using SafeMath for uint256;
    using Strings for uint256;

    uint256 public constant MAX_TEAM_PER_GM = 10;
    uint256 public constant MAX_PLAYERS_PER_TEAM = 7;

    struct Group {
        address gm;
        uint256 teamId;
        address[] players;
        string name;
        string imageURI;
        string description;
        bool isActive;
        bool sessionExists;
        uint sessionId;
    }

    Group[] private teams;
    mapping(address => uint256) public teamsByPlayer;
    mapping(address => uint256[]) public teamsByGM;

    Certification public certificationContract;
    Session public sessionContract;

    event TeamCreated(uint256 teamId, address gm);
    event PlayerJoinedTeam(uint256 teamId, address player);
    event PlayerLeftTeam(uint256 teamId, address player);
    event TeamDeleted(uint256 teamId);
    event GamesPlayedIncremented(uint256 teamId);
    event SessionCreated(uint256 teamId, address gm);
    event SessionEnd(uint256 teamId, address gm);

    constructor(
        address _sessionContractAddress,
        address _certificationContractAddress
    ) {
        sessionContract = Session(_sessionContractAddress);
        certificationContract = Certification(_certificationContractAddress);
    }

    modifier teamIsActive(uint256 teamId) {
        require(teams[teamId].isActive, "Team does not exist or is not active");
        _;
    }

    modifier onlyTeamMember(uint256 teamId) {
        require(
            teams[teamId].gm == msg.sender ||
                teamsByPlayer[msg.sender] == teamId,
            "Only team members can perform this action"
        );
        _;
    }

    modifier onlyGM(uint256 teamId) {
        require(
            teams[teamId].gm == msg.sender,
            "Only GM can perform this action"
        );
        _;
    }
    modifier onlyPlayer(uint256 teamId) {
        require(
            teamsByPlayer[msg.sender] == teamId,
            "Only player can perform this action"
        );
        _;
    }

    modifier onlySessionExists(uint256 teamId) {
        require(teams[teamId].sessionExists, "Session does not exist");
        _;
    }

    function createTeam(
        string memory _name,
        string memory image,
        string memory _desc
    ) public returns (uint256) {
        require(
            teamsByGM[msg.sender].length < MAX_TEAM_PER_GM,
            "GM has too many teams"
        );

        Group memory group;
        group.gm = msg.sender;
        group.name = _name;
        group.imageURI = image;
        group.description = _desc;
        group.teamId = teams.length;
        group.isActive = true;
        group.sessionExists = false;
        teams.push(group);
        teamsByGM[msg.sender].push(group.teamId);

        emit TeamCreated(group.teamId, msg.sender);
        return group.teamId;
    }

    /// @param teamId The ID of the team
    /// @dev This function is used to join a team
    /// @notice This function is used to join a team
    function joinTeam(
        uint256 teamId
    ) public teamIsActive(teamId) returns (uint256) {
        require(
            teams[teamId].players.length < MAX_PLAYERS_PER_TEAM,
            "Team is full"
        );
        require(teamsByPlayer[msg.sender] == 0, "Player already in this team");

        teams[teamId].players.push(msg.sender);
        teamsByPlayer[msg.sender] = teamId;

        emit PlayerJoinedTeam(teamId, msg.sender);
        return teamId;
    }

    /// Leave a team
    /// @param teamId The ID of the team
    /// @dev This function is used to leave a team
    function leaveTeam(uint256 teamId) public teamIsActive(teamId) {
        require(teamsByPlayer[msg.sender] == teamId, "Player not in this team");

        uint256 playerIndex;
        for (uint256 i = 0; i < teams[teamId].players.length; i++) {
            if (teams[teamId].players[i] == msg.sender) {
                playerIndex = i;
                break;
            }
        }

        teams[teamId].players[playerIndex] = teams[teamId].players[
            teams[teamId].players.length - 1
        ];
        teams[teamId].players.pop();
        teamsByPlayer[msg.sender] = 0;

        emit PlayerLeftTeam(teamId, msg.sender);
    }

    function deleteTeam(uint256 teamId) public teamIsActive(teamId) {
        require(teams[teamId].gm == msg.sender, "Only GM can delete the team");

        teams[teamId].isActive = false;

        emit TeamDeleted(teamId);
    }

    /// @notice Returns the team
    /// @param teamId The ID of the team
    /// @return The team
    /// @dev This function is used to get a team
    function getTeam(
        uint256 teamId
    ) public view teamIsActive(teamId) returns (Group memory) {
        return teams[teamId];
    }

    /// @notice Returns the teams of a GM
    /// @param gm The address of the GM
    /// @return An array of team IDs
    /// @dev This function is used to get the teams of a GM
    function getTeamsOfGM(address gm) public view returns (uint256[] memory) {
        return teamsByGM[gm];
    }

    /// @notice Returns the teams of a player
    /// @param playerAddress The address of the player
    /// @return An array of team IDs
    /// @dev This function is used to get the teams of a player
    function getTeamsOfPlayer(
        address playerAddress
    ) public view returns (uint256) {
        return teamsByPlayer[playerAddress];
    }

    //////////////////////////////
    //// Session functions
    //////////////////////////////

    function isSessionActive(uint256 teamId) external view returns (bool) {
        return teams[teamId].sessionExists;
    }

    function payFee(
        uint256 teamId
    )
        external
        payable
        teamIsActive(teamId)
        onlyTeamMember(teamId)
        onlySessionExists(teamId)
    {
        sessionContract.payFee{value: msg.value}(teamId);
    }

    function rollDice(
        uint256 teamId,
        uint8 diceSides
    )
        external
        teamIsActive(teamId)
        onlyTeamMember(teamId)
        onlySessionExists(teamId)
        returns (uint8)
    {
        return sessionContract.rollDice(teamId, diceSides);
    }

    function sendMessage(
        uint256 teamId,
        string memory message
    )
        external
        teamIsActive(teamId)
        onlyTeamMember(teamId)
        onlySessionExists(teamId)
    {
        sessionContract.sendMessage(teamId, message);
    }

    function createSession(
        uint256 teamId,
        uint256 amount
    )
        external
        teamIsActive(teamId)
        onlyTeamMember(teamId)
    {
        require(!teams[teamId].sessionExists, "Session already exists");
        require(amount > 0, "Amount must be greater than 0");

        uint256 sessionId = sessionContract.createSession(
            teamId,
            teams[teamId].gm,
            teams[teamId].players,
            amount
        );

        teams[teamId].sessionId = sessionId;
        teams[teamId].sessionExists = true;

        emit SessionCreated(teamId, msg.sender);
    }

    function endSession(
        uint256 teamId
    )
        external
        teamIsActive(teamId)
        onlyTeamMember(teamId)
        onlySessionExists(teamId)
    {
        (bool success, ) = address(sessionContract).call(
            abi.encodeWithSignature("endSession()", teamId)
        );
        require(success, "Session end failed");

        // Reward players with NFT certification
        for (uint i = 0; i < teams[teamId].players.length; i++) {
            // Define the parameters for the diploma
            address playerAddress = teams[teamId].players[i];
            address teamAddress = address(this);
            string memory date = block.timestamp.toString();

            // Mint the diploma
            certificationContract.mintDiploma(playerAddress, teamAddress, date);
        }

        teams[teamId].sessionId = 0;
        teams[teamId].sessionExists = false;

        emit SessionEnd(teamId, msg.sender);
    }
}
