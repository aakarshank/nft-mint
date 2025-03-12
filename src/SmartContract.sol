// SPDX-License-Identifier: GPL-3.0


//this smart contract was written in the REMIX ide, and was included here for convenience.

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFT is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;

    uint256[] public token_id_store;
    struct NFTInfo {
        uint256 tokenID;
        string name;
        string uri;
        address owner;
        uint256 price;
        string imageURI;
        bool bought;

    }
    mapping(uint256=> NFTInfo) public NFT_MAPPING;

    constructor() ERC721("NFTTrade", "NFTT") {}

    function mintNFT(string memory _uri, string memory _imageURI, uint256 _price, string memory _name) public returns (uint256) {
        _tokenIDs.increment();
        uint256 _tokenID = _tokenIDs.current();

        _mint(msg.sender, _tokenID);
        _setTokenURI(_tokenID, _uri);
        NFT_MAPPING[_tokenID]= NFTInfo({
            tokenID:_tokenID,
            name: _name,
            uri: _uri,
            owner: msg.sender,
            price: _price,
            imageURI:_imageURI,
            bought:false
        });
        token_id_store.push(_tokenID);

        return _tokenID;
    }
    function buyNFT(uint256 _tokenID)  public payable{
        address owner = NFT_MAPPING[_tokenID].owner;

        //require(price > 0, "NFT not for sale");
        //require(msg.value == price, "Incorrect ETH amount sent");
        //require(owner != msg.sender, "Cannot buy your own NFT");


        // Transfer NFT first to prevent reentrancy attack


        NFT_MAPPING[_tokenID].owner = msg.sender;
        NFT_MAPPING[_tokenID].bought=true; // Mark as sold

        _transfer(ownerOf(_tokenID), msg.sender, _tokenID);

        (bool sent, ) = payable(owner).call{value: msg.value}("");
        require(sent, "Failed to send ETH");
    }

    function burnNFT(uint256 _tokenID) public {
        require(ownerOf(_tokenID) == msg.sender, "Only the owner can burn");
        for (uint i = 0; i < token_id_store.length;i++){
            if (token_id_store[i] == _tokenID){
                token_id_store[i] = token_id_store[token_id_store.length-1];
                token_id_store.pop();
                break;
            }
        }

        delete NFT_MAPPING[_tokenID];

        _burn(_tokenID);
    }

    function transferOwnership(address receiver, uint256 tokenID) public {
        require(ownerOf(tokenID) == msg.sender, "Ownership can only be transferred by the owner");
        require(receiver != address(0), "Receiver isn't a proper address");
        safeTransferFrom(msg.sender, receiver, tokenID);
        NFT_MAPPING[tokenID].owner = receiver;
    }

    function returnAllNFTs() public view returns (NFTInfo[] memory){
        NFTInfo[] memory _allNFTs = new NFTInfo[](token_id_store.length);
        for (uint256 i = 0; i < token_id_store.length; i++){
            _allNFTs[i] = NFT_MAPPING[token_id_store[i]];
        }
        return _allNFTs;
    }

    function isOwner(uint256 tokenID) public view returns (bool) {
        return (ownerOf(tokenID)==msg.sender);
    }
}