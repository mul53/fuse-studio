pragma solidity ^0.4.24;

import "./CommunityTransferManager.sol";

contract CommunityFactory is Ownable {
  event CommunityCreated(address indexed community, string name);
  event TokenRegistered(address indexed community, address token);

  function createCommunity(string _name, address _admin) public {
    require(bytes(_name).length != 0, "NAME_CANNOT_BE_EMPTY");
    CommunityTransferManager community = new CommunityTransferManager(_name, _admin);

    emit CommunityCreated(address(community), _name);
  }

  function registerCommunity(address _community) public onlyOwner {
    Community community = Community(_community);

    emit CommunityCreated(address(community), community.name());
  }

  function registerToken(address _community, address _token) public onlyOwner {
    emit TokenRegistered(_community, _token);
  }
}