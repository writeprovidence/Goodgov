// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QuizRewards is Ownable {
    using ECDSA for bytes32;

    IERC20 public goodDollar;
    address public signerWallet;

    // Mapping to track which address claimed which quiz reward
    // userAddress => quizId => claimed
    mapping(address => mapping(string => bool)) public hasClaimed;

    event RewardClaimed(address indexed user, string quizId, uint256 amount);

    constructor(address _goodDollar, address _signerWallet) {
        goodDollar = IERC20(_goodDollar);
        signerWallet = _signerWallet;
    }

    function setSignerWallet(address _signerWallet) external onlyOwner {
        signerWallet = _signerWallet;
    }

    function claimReward(
        string memory quizId,
        uint256 amount,
        bytes memory signature
    ) external {
        require(
            !hasClaimed[msg.sender][quizId],
            "Reward already claimed for this quiz"
        );

        // Recreate the signed message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, quizId, amount)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        require(
            ethSignedMessageHash.recover(signature) == signerWallet,
            "Invalid signature"
        );

        hasClaimed[msg.sender][quizId] = true;

        require(goodDollar.transfer(msg.sender, amount), "Transfer failed");

        emit RewardClaimed(msg.sender, quizId, amount);
    }

    // Allow the owner to withdraw tokens in case of emergency or if the contract is being retired
    function withdrawTokens(
        address _token,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_token).transfer(msg.sender, _amount);
    }

    // Fallback function to accept CELO (though mainly we use ERC-20 G$)
    receive() external payable {}
}
