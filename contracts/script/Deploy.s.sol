// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console } from "forge-std/Script.sol";
import { RINDOToken } from "../src/RINDOToken.sol";
import { VoucherNFT } from "../src/VoucherNFT.sol";

/**
 * @title Deploy
 * @dev Deployment script for RINDOToken and VoucherNFT contracts
 * Usage: forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
 */
contract Deploy is Script {
    function run() external returns (RINDOToken token, VoucherNFT voucher) {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("========================================");
        console.log("REALINDO DEPLOYMENT SCRIPT");
        console.log("========================================");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy RINDOToken
        console.log("Deploying RINDOToken...");
        token = new RINDOToken();
        console.log("RINDOToken deployed at:", address(token));
        console.log("");

        // 2. Deploy VoucherNFT with RINDOToken address
        console.log("Deploying VoucherNFT...");
        voucher = new VoucherNFT(address(token));
        console.log("VoucherNFT deployed at:", address(voucher));
        console.log("");

        vm.stopBroadcast();

        // Log summary
        console.log("========================================");
        console.log("DEPLOYMENT SUMMARY");
        console.log("========================================");
        console.log("RINDOToken:", address(token));
        console.log("VoucherNFT:", address(voucher));
        console.log("");
        console.log("Save these addresses to your .env.local:");
        console.log("NEXT_PUBLIC_RINDO_TOKEN_ADDRESS=%s", address(token));
        console.log("NEXT_PUBLIC_VOUCHER_NFT_ADDRESS=%s", address(voucher));
        console.log("========================================");
    }
}
