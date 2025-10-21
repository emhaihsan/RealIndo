// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console } from "forge-std/Test.sol";
import { RINDOToken } from "../src/RINDOToken.sol";

contract RINDOTokenTest is Test {
    RINDOToken public token;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        token = new RINDOToken();
    }

    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Deployment_Name() public view {
        assertEq(token.name(), "RealIndo Token");
    }

    function test_Deployment_Symbol() public view {
        assertEq(token.symbol(), "RINDO");
    }

    function test_Deployment_Decimals() public view {
        assertEq(token.decimals(), 18);
    }

    function test_Deployment_InitialSupply() public view {
        assertEq(token.totalSupply(), 0);
    }

    function test_Deployment_OwnerSet() public view {
        assertEq(token.owner(), owner);
    }

    /*//////////////////////////////////////////////////////////////
                            MINT FROM EXP TESTS
    //////////////////////////////////////////////////////////////*/

    function test_MintFromEXP_Success() public {
        uint256 amount = 100 * 10 ** 18;

        token.mintFromEXP(user1, amount);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), amount);
    }

    function test_MintFromEXP_EmitsTransferEvent() public {
        uint256 amount = 50 * 10 ** 18;

        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), user1, amount);

        token.mintFromEXP(user1, amount);
    }

    function test_MintFromEXP_OnlyOwner() public {
        uint256 amount = 100 * 10 ** 18;

        // Non-owner should revert
        vm.prank(user1);
        vm.expectRevert();
        token.mintFromEXP(user2, amount);
    }

    function test_MintFromEXP_RevertsOnZeroAddress() public {
        uint256 amount = 100 * 10 ** 18;

        vm.expectRevert();
        token.mintFromEXP(address(0), amount);
    }

    function test_MintFromEXP_MultipleMints() public {
        uint256 amount1 = 100 * 10 ** 18;
        uint256 amount2 = 50 * 10 ** 18;

        token.mintFromEXP(user1, amount1);
        token.mintFromEXP(user1, amount2);

        assertEq(token.balanceOf(user1), amount1 + amount2);
        assertEq(token.totalSupply(), amount1 + amount2);
    }

    /*//////////////////////////////////////////////////////////////
                        STANDARD ERC20 TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Transfer_Success() public {
        uint256 amount = 100 * 10 ** 18;
        token.mintFromEXP(user1, amount);

        vm.prank(user1);
        bool success = token.transfer(user2, 30 * 10 ** 18);

        assertTrue(success);
        assertEq(token.balanceOf(user1), 70 * 10 ** 18);
        assertEq(token.balanceOf(user2), 30 * 10 ** 18);
    }

    function test_Transfer_RevertsOnInsufficientBalance() public {
        uint256 amount = 100 * 10 ** 18;
        token.mintFromEXP(user1, amount);

        vm.prank(user1);
        vm.expectRevert();
        token.transfer(user2, 150 * 10 ** 18);
    }

    function test_Approve_Success() public {
        uint256 amount = 100 * 10 ** 18;

        vm.prank(user1);
        bool success = token.approve(user2, amount);

        assertTrue(success);
        assertEq(token.allowance(user1, user2), amount);
    }

    function test_TransferFrom_Success() public {
        uint256 amount = 100 * 10 ** 18;
        token.mintFromEXP(user1, amount);

        // user1 approves user2 to spend
        vm.prank(user1);
        token.approve(user2, amount);

        // user2 transfers from user1 to themselves
        vm.prank(user2);
        bool success = token.transferFrom(user1, user2, 50 * 10 ** 18);

        assertTrue(success);
        assertEq(token.balanceOf(user1), 50 * 10 ** 18);
        assertEq(token.balanceOf(user2), 50 * 10 ** 18);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_MintFromEXP(address to, uint256 amount) public {
        // Avoid zero address and amounts that would overflow
        vm.assume(to != address(0));
        vm.assume(amount < type(uint256).max / 2);

        token.mintFromEXP(to, amount);

        assertEq(token.balanceOf(to), amount);
    }

    /*//////////////////////////////////////////////////////////////
                            EVENTS
    //////////////////////////////////////////////////////////////*/

    event Transfer(address indexed from, address indexed to, uint256 value);
}
