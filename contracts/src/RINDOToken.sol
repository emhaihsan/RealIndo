// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RINDOToken
 * @dev ERC20 token for RealIndo platform
 * Users earn RINDO tokens by completing learning modules (converting EXP to RINDO)
 * Tokens can be used to redeem vouchers (NFTs)
 */
contract RINDOToken is ERC20, Ownable {
    /**
     * @dev Constructor sets token name and symbol
     * Deployer becomes the owner who can mint tokens
     */
    constructor() ERC20("RealIndo Token", "RINDO") Ownable(msg.sender) {
        // Initial supply is 0, tokens are minted on demand
    }

    /**
     * @dev Mints RINDO tokens from user's EXP points
     * Only backend (owner) can call this function
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mintFromEXP(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
