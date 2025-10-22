// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VoucherNFT.sol";

/**
 * @title AddVouchers
 * @dev Script to add vouchers to VoucherNFT contract
 * Run: forge script script/AddVouchers.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
 */
contract AddVouchers is Script {
    // Deployed contract address
    address constant VOUCHER_NFT_ADDRESS = 0x5e004185A592832B3FD3cdce364dA3bdf2B08A3d;

    function run() external {
        // Load private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        VoucherNFT voucherNFT = VoucherNFT(VOUCHER_NFT_ADDRESS);

        console.log("Adding vouchers to VoucherNFT contract...");
        console.log("Contract address:", VOUCHER_NFT_ADDRESS);

        // Voucher 1: Soto Banjar (10 RINDO, tokenId = 1)
        uint256 tokenId1 = 1;
        string memory uri1 = "ipfs://bafybeiagu456r4ooezdhwsof3zw4xljlh7jqknwm5vibfrusoyk4ctik3m";
        uint256 cost1 = 10 ether; // 10 RINDO (18 decimals)

        voucherNFT.addVoucher(tokenId1, uri1, cost1);
        console.log("Voucher 1 added:");
        console.log("  Token ID:", tokenId1);
        console.log("  Cost:", cost1 / 1e18, "RINDO");
        console.log("  URI:", uri1);

        // Voucher 2: Pasar Terapung (20 RINDO, tokenId = 2)
        uint256 tokenId2 = 2;
        string memory uri2 = "ipfs://bafkreibnb22hce2ouqqiwy7hgk57rzgjb6u3nygwikg7wjehnh6i7xkewe";
        uint256 cost2 = 20 ether; // 20 RINDO (18 decimals)

        voucherNFT.addVoucher(tokenId2, uri2, cost2);
        console.log("Voucher 2 added:");
        console.log("  Token ID:", tokenId2);
        console.log("  Cost:", cost2 / 1e18, "RINDO");
        console.log("  URI:", uri2);

        vm.stopBroadcast();

        console.log("\nVouchers added successfully!");
        console.log("You can now redeem vouchers via the marketplace.");
    }
}
