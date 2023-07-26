// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Certification is ERC721URIStorage, Ownable, ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    address public sessionContractAddress;

    struct Diploma {
        address playerAddress;
        address teamAddress;
        string date;
    }

    constructor(address _sessionContractAddress) ERC721("Diploma", "DIP") {
        sessionContractAddress = _sessionContractAddress;
    }

    mapping(uint256 => Diploma) private diplomas;

    function mintDiploma(
        address playerAddress,
        address teamAddress,
        string memory date
    ) external returns (uint256) {
        require(
            msg.sender == sessionContractAddress,
            "Only the Session contract can mint"
        );

        uint256 newItemId = _tokenIdCounter.current();
        // Give control to player address
        _safeMint(playerAddress, newItemId);
        diplomas[newItemId] = Diploma(
            playerAddress,
            teamAddress,
            date
        );
        _tokenIdCounter.increment();
        return newItemId;
    }

    // diplomaId is the tokenId
    function getDiploma(
        uint256 diplomaId
    ) external view returns (Diploma memory) {
        return diplomas[diplomaId];
    }

    function getAllDiplomasOfPlayer(
    ) external view returns (uint256[] memory) {
        require(
            balanceOf(msg.sender) > 0,
            "Player does not have any certificates"
        );
        uint256 balance = balanceOf(msg.sender);
        uint256[] memory result = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            result[i] = tokenOfOwnerByIndex(msg.sender, i);
        }
        return result;
    }

    function getCertificateURI(
        address playerAddress,
        uint256 index
    ) public view returns (string memory) {
        uint256 tokenId = tokenOfOwnerByIndex(playerAddress, index);
        return tokenURI(tokenId);
    }

    function getAllCertificatesOfPlayer(
    ) external view returns (string[] memory) {
        require(
            balanceOf(msg.sender) > 0,
            "Player does not have any certificates"
        );
        uint256 balance = balanceOf(msg.sender);
        string[] memory result = new string[](balance);
        for (uint256 i = 0; i < balance; i++) {
            result[i] = getCertificateURI(msg.sender, i);
        }
        return result;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        Diploma memory diploma = diplomas[tokenId];
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">',
                '<rect width="100%" height="100%" fill="#ffffff" />',
                '<rect x="50" y="50" width="700" height="500" fill="none" stroke="#000000" stroke-width="6" />',
                unicode'<text x="400" y="120" font-family="Brush Script MT, cursive" font-size="60" text-anchor="middle" fill="#000000">Diploma</text>',
                '<line x1="100" y1="160" x2="700" y2="160" stroke="#d4af37" stroke-width="4" />',
                '<line x1="100" y1="161" x2="700" y2="161" stroke="#d4af37" stroke-width="4" />',
                '<text x="120" y="270" font-family="Dancing Script, cursive" font-size="30" fill="#000000">',
                unicode"⬖ ",
                diploma.playerAddress,
                "</text>",
                '<text x="120" y="320" font-family="Dancing Script, cursive" font-size="30" fill="#000000">Team ',
                unicode"⬖: ",
                diploma.teamAddress,
                "</text>",
                unicode'<text x="120" y="370" font-family="Dancing Script, cursive" font-size="30" fill="#000000">Date of achievement: ',
                diploma.date,
                "</text>",
                unicode'<text x="400" y="470" font-family="Dancing Script, cursive" font-size="42" text-anchor="middle" fill="#000000">Congratulations!</text>',
                unicode'<text x="400" y="520" font-family="Dancing Script, cursive" font-size="30" text-anchor="middle" fill="#000000">You have successfully completed your quest.</text>',
                '<text x="700" y="570" font-family="Dancing Script, cursive" font-size="24" text-anchor="end" fill="#000000">Blockquest</text>',
                "</svg>"
            )
        );
        string memory data = Base64.encode(bytes(svg));
        string memory metadata = string(
            abi.encodePacked(
                '{"name": "Diploma #',
                Strings.toString(tokenId),
                '", "description": "This is a diploma for successfully completing a game quest", "image": "data:image/svg+xml;base64,',
                data,
                '"}'
            )
        );
        string memory json = Base64.encode(bytes(metadata));
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
