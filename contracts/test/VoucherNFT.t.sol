// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console } from "forge-std/Test.sol";
import { VoucherNFT } from "../src/VoucherNFT.sol";
import { RINDOToken } from "../src/RINDOToken.sol";

contract VoucherNFTTest is Test {
    VoucherNFT public voucher;
    RINDOToken public token;

    address public owner;
    address public user1;
    address public user2;

    uint256 constant VOUCHER_ID_1 = 1;
    uint256 constant VOUCHER_ID_2 = 2;
    uint256 constant COST_100_RINDO = 100 * 10 ** 18;
    uint256 constant COST_50_RINDO = 50 * 10 ** 18;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy RINDO token first
        token = new RINDOToken();

        // Deploy VoucherNFT with token address
        voucher = new VoucherNFT(address(token));
    }

    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Deployment_TokenAddressSet() public view {
        assertEq(address(voucher.rindoToken()), address(token));
    }

    function test_Deployment_OwnerSet() public view {
        assertEq(voucher.owner(), owner);
    }

    /*//////////////////////////////////////////////////////////////
                            ADD VOUCHER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_AddVoucher_Success() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);

        assertEq(voucher.voucherCost(VOUCHER_ID_1), COST_100_RINDO);
    }

    function test_AddVoucher_EmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit VoucherAdded(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);

        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
    }

    function test_AddVoucher_OnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
    }

    function test_AddVoucher_Multiple() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
        voucher.addVoucher(VOUCHER_ID_2, "ipfs://voucher2", COST_50_RINDO);

        assertEq(voucher.voucherCost(VOUCHER_ID_1), COST_100_RINDO);
        assertEq(voucher.voucherCost(VOUCHER_ID_2), COST_50_RINDO);
    }

    function test_AddVoucher_CanUpdateExisting() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1_v2", COST_50_RINDO);

        assertEq(voucher.voucherCost(VOUCHER_ID_1), COST_50_RINDO);
    }

    /*//////////////////////////////////////////////////////////////
                        REDEEM VOUCHER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_RedeemVoucher_Success() public {
        // Setup: Add voucher and mint tokens to user
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
        token.mintFromEXP(user1, COST_100_RINDO);

        // User approves voucher contract to spend tokens
        vm.prank(user1);
        token.approve(address(voucher), COST_100_RINDO);

        // User redeems voucher
        vm.prank(user1);
        voucher.redeemVoucher(VOUCHER_ID_1, 1);

        // Check NFT balance
        assertEq(voucher.balanceOf(user1, VOUCHER_ID_1), 1);
        // Check RINDO balance (should be 0 after redeem)
        assertEq(token.balanceOf(user1), 0);
    }

    function test_RedeemVoucher_EmitsEvent() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
        token.mintFromEXP(user1, COST_100_RINDO);

        vm.prank(user1);
        token.approve(address(voucher), COST_100_RINDO);

        vm.expectEmit(true, true, false, true);
        emit VoucherRedeemed(user1, VOUCHER_ID_1, 1);

        vm.prank(user1);
        voucher.redeemVoucher(VOUCHER_ID_1, 1);
    }

    function test_RedeemVoucher_MultipleQuantity() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
        token.mintFromEXP(user1, COST_100_RINDO * 3);

        vm.prank(user1);
        token.approve(address(voucher), COST_100_RINDO * 3);

        vm.prank(user1);
        voucher.redeemVoucher(VOUCHER_ID_1, 3);

        assertEq(voucher.balanceOf(user1, VOUCHER_ID_1), 3);
        assertEq(token.balanceOf(user1), 0);
    }

    function test_RedeemVoucher_RevertsOnInvalidVoucher() public {
        // Voucher ID 999 doesn't exist (cost = 0)
        token.mintFromEXP(user1, COST_100_RINDO);

        vm.prank(user1);
        token.approve(address(voucher), COST_100_RINDO);

        vm.prank(user1);
        vm.expectRevert("Voucher does not exist");
        voucher.redeemVoucher(999, 1);
    }

    function test_RedeemVoucher_RevertsOnInsufficientBalance() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
        token.mintFromEXP(user1, COST_50_RINDO); // Not enough

        vm.prank(user1);
        token.approve(address(voucher), COST_100_RINDO);

        vm.prank(user1);
        vm.expectRevert();
        voucher.redeemVoucher(VOUCHER_ID_1, 1);
    }

    function test_RedeemVoucher_RevertsOnInsufficientAllowance() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
        token.mintFromEXP(user1, COST_100_RINDO);

        // User doesn't approve spending

        vm.prank(user1);
        vm.expectRevert();
        voucher.redeemVoucher(VOUCHER_ID_1, 1);
    }

    /*//////////////////////////////////////////////////////////////
                            ERC1155 TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ERC1155_BalanceOf() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);
        token.mintFromEXP(user1, COST_100_RINDO);

        vm.prank(user1);
        token.approve(address(voucher), COST_100_RINDO);

        vm.prank(user1);
        voucher.redeemVoucher(VOUCHER_ID_1, 1);

        assertEq(voucher.balanceOf(user1, VOUCHER_ID_1), 1);
        assertEq(voucher.balanceOf(user2, VOUCHER_ID_1), 0);
    }

    function test_ERC1155_URI() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);

        assertEq(voucher.uri(VOUCHER_ID_1), "ipfs://voucher1");
    }

    /*//////////////////////////////////////////////////////////////
                            EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_RedeemVoucher_ZeroQuantity() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);

        vm.prank(user1);
        vm.expectRevert("Amount must be greater than 0");
        voucher.redeemVoucher(VOUCHER_ID_1, 0);
    }

    function test_MultipleUsersCanRedeemSameVoucher() public {
        voucher.addVoucher(VOUCHER_ID_1, "ipfs://voucher1", COST_100_RINDO);

        // Mint tokens to both users
        token.mintFromEXP(user1, COST_100_RINDO);
        token.mintFromEXP(user2, COST_100_RINDO);

        // User1 redeems
        vm.prank(user1);
        token.approve(address(voucher), COST_100_RINDO);
        vm.prank(user1);
        voucher.redeemVoucher(VOUCHER_ID_1, 1);

        // User2 redeems
        vm.prank(user2);
        token.approve(address(voucher), COST_100_RINDO);
        vm.prank(user2);
        voucher.redeemVoucher(VOUCHER_ID_1, 1);

        assertEq(voucher.balanceOf(user1, VOUCHER_ID_1), 1);
        assertEq(voucher.balanceOf(user2, VOUCHER_ID_1), 1);
    }

    /*//////////////////////////////////////////////////////////////
                            EVENTS
    //////////////////////////////////////////////////////////////*/

    event VoucherAdded(uint256 indexed tokenId, string uri, uint256 cost);
    event VoucherRedeemed(address indexed user, uint256 indexed tokenId, uint256 amount);
}
