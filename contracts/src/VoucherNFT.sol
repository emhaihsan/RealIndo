// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VoucherNFT
 * @dev ERC1155 NFT contract for RealIndo vouchers
 * Users can redeem vouchers by burning RINDO tokens
 * Each voucher type has a unique tokenId and cost in RINDO
 */
contract VoucherNFT is ERC1155, Ownable {
    // Reference to RINDO token contract
    IERC20 public immutable rindoToken;

    // Mapping: tokenId => cost in RINDO tokens (18 decimals)
    mapping(uint256 => uint256) public voucherCost;

    // Mapping: tokenId => metadata URI
    mapping(uint256 => string) private _uris;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event VoucherAdded(uint256 indexed tokenId, string uri, uint256 cost);
    event VoucherRedeemed(address indexed user, uint256 indexed tokenId, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Constructor sets RINDO token address
     * @param _rindoToken Address of the RINDO ERC20 token
     */
    constructor(address _rindoToken) ERC1155("") Ownable(msg.sender) {
        require(_rindoToken != address(0), "Invalid token address");
        rindoToken = IERC20(_rindoToken);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Add new voucher or update existing one
     * Only owner (backend) can call this
     * @param tokenId Unique identifier for the voucher type
     * @param metadataUri IPFS URI for voucher metadata (image, description, etc.)
     * @param cost Cost in RINDO tokens (18 decimals)
     */
    function addVoucher(uint256 tokenId, string memory metadataUri, uint256 cost)
        external
        onlyOwner
    {
        voucherCost[tokenId] = cost;
        _uris[tokenId] = metadataUri;

        emit VoucherAdded(tokenId, metadataUri, cost);
    }

    /*//////////////////////////////////////////////////////////////
                            USER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Redeem voucher by burning RINDO tokens
     * User must approve this contract to spend RINDO first
     * @param tokenId Voucher type to redeem
     * @param amount Quantity of vouchers to redeem
     */
    function redeemVoucher(uint256 tokenId, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        uint256 cost = voucherCost[tokenId];
        require(cost > 0, "Voucher does not exist");

        uint256 totalCost = cost * amount;

        // Transfer (burn) RINDO from user to this contract
        // User must have approved this contract to spend tokens
        require(
            rindoToken.transferFrom(msg.sender, address(this), totalCost), "RINDO transfer failed"
        );

        // Mint NFT voucher to user
        _mint(msg.sender, tokenId, amount, "");

        emit VoucherRedeemed(msg.sender, tokenId, amount);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Returns the URI for a specific token ID
     * Overrides ERC1155 uri function to return per-token URIs
     * @param tokenId Token ID to get URI for
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _uris[tokenId];
    }
}
