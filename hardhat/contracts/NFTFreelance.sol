// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract NFTFreelance is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct listing{
        uint256 listingId;
        uint256 listing_price;
        uint256 project_cost;
        address client;
        uint timestamp; 
        bool available;
    }

    struct project{
        address clientId;
        address freelancerId;
        uint256 listingId;
        uint256 project_cost;
    }

    mapping (uint256 => project) private projects;
    mapping (uint256 => listing) private listings;

    uint256 total_clientId = 0;
    uint256 total_freelancerId = 0;

    event listingMintedEvent(
        uint256 indexed tokenId,
        address client,
        uint256 listing_price,
        uint256 project_cost
    );

    event purchaseListingEvent(
        uint256 indexed tokenId,
        address client,
        address freelancer,
        uint256 listing_price
    );

    event assignProjectEvent(
        uint256 indexed tokenId,
        address client,
        address freelance,
        uint256 listing_price,
        uint256 project_cost
    );

    event rejectProjectEvent(
        uint256 indexed tokenId,
        address client,
        address freelancer
    );

    event projectCompleted(
        uint256 indexed tokenId,
        address client,
        address freelancer,
        uint256 project_cost
    );

    event addFreelancerEvent(
        address indexed freelancerId,
        string name,
        uint256 phone_number,
        string email
    );

    event addClientEvent(
        address indexed clientId,
        string name,
        string email,
        uint256 phone_number,
        string company_name
    );

    address contractOwner;
    address token_address;

    constructor(address _token_address) ERC721("NFTFreelance", "NFTF") {
        contractOwner = msg.sender;
        token_address = _token_address;
    }

    function addFreelancer(string memory _name, string memory _email, uint256 _phone_number) public {
        emit addFreelancerEvent(msg.sender, _name, _phone_number, _email);
    }

    function addClient(string memory _name, string memory _email, uint256 _phone_number, string memory _company_name) public {
        emit addClientEvent(msg.sender, _name, _email, _phone_number, _company_name);
    }

    function createListing(string memory uri, uint256 _listing_price, uint256 _project_cost, uint _timestamp) public {
        require(_listing_price > 0, "Listing price can't be zero");
        require(_project_cost > 0, "Project cost can't be zero");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(address(this), tokenId);
        _setTokenURI(tokenId, uri);
        listings[tokenId] = listing(tokenId, _listing_price, _project_cost, msg.sender, _timestamp, true);
        emit listingMintedEvent(tokenId, msg.sender, _listing_price, _project_cost);
    }


    function purchaseListing(uint256 tokenId) public {
        require(listings[tokenId].available == true, "Already bought by someone");
        uint256 allowance = IERC20(token_address).allowance(msg.sender, address(this));
        require(allowance >= listings[tokenId].listing_price, "Please allow the required amount to the smart contract");
        IERC20(token_address).transferFrom(msg.sender, address(this), listings[tokenId].listing_price);
        _transfer(address(this), msg.sender, tokenId);
        listings[tokenId].available = false;
        emit purchaseListingEvent(tokenId, listings[tokenId].client, msg.sender, listings[tokenId].listing_price);
    }

    function assignProject(uint256 tokenId, address _freelancer) public{
        require(msg.sender == listings[tokenId].client, "Only the owner can call this function");
        uint256 allowance = IERC20(token_address).allowance(msg.sender, address(this));
        require(allowance > listings[tokenId].project_cost, "You need to lock the project amount");
        IERC20(token_address).transferFrom(msg.sender, address(this), listings[tokenId].project_cost);
        projects[tokenId] = project(listings[tokenId].client, _freelancer, tokenId, listings[tokenId].project_cost);
        emit assignProjectEvent(tokenId, listings[tokenId].client, _freelancer, listings[tokenId].listing_price, listings[tokenId].project_cost);
    }

    function rejectProject(uint256 tokenId, address _freelancer) public {
        require(msg.sender == listings[tokenId].client, "Only the owner can call this function");
        IERC20(token_address).transfer(_freelancer, listings[tokenId].listing_price);
        _transfer(_freelancer, address(this), tokenId);
        listings[tokenId].available = true;
        emit rejectProjectEvent(tokenId, listings[tokenId].client, _freelancer);
    }


    function completeProject(uint256 tokenId) public {
        require(projects[tokenId].clientId == msg.sender, "Only the NFT creator can call this fucntion");
        _burn(tokenId);
        IERC20(token_address).transfer(projects[tokenId].freelancerId, projects[tokenId].project_cost);
        emit projectCompleted(tokenId, projects[tokenId].clientId, projects[tokenId].freelancerId, projects[tokenId].project_cost);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}