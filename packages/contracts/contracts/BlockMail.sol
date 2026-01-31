// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BlockMail {
    mapping(address => bytes) public messagingPubKey;

    event PubKeySet(
        address indexed user, 
        bytes pubKey
    );

    event Message(
        address indexed from,
        address indexed to,
        string cid,
        bytes32 metaHash,
        uint64 sentAt
    );

    function setMessagingPubKey(bytes calldata pubKey) external {
        messagingPubKey[msg.sender] = pubKey;
        emit PubKeySet(msg.sender, pubKey);
    }

    function sendMessage(address to, string calldata cid, bytes32 metaHash) external {
        emit Message(msg.sender, to, cid, metaHash, uint64(block.timestamp));
    }
}
