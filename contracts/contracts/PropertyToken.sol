// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyToken
 * @notice ERC20 token representing fractional ownership shares in a single real estate property.
 * @dev Each token is a whole share (decimals = 0). A fixed supply of 100 tokens is minted
 *      to the admin wallet at deployment. This contract is intentionally minimal — it only
 *      handles the token itself. All sale logic, pricing, and payment handling live elsewhere.
 */
contract PropertyToken is ERC20, Ownable {
    /// @notice Identifier of the real estate property this token represents.
    uint256 public propertyId;

    /// @notice Wallet that received the initial 100-token supply and serves as admin.
    address public adminWallet;

    /**
     * @param _propertyId  Unique identifier for the underlying property.
     * @param _name        ERC20 token name.
     * @param _symbol      ERC20 token symbol.
     * @param _adminWallet Address that receives the full initial supply of 100 tokens
     *                     and is set as the contract owner.
     */
    constructor(
        uint256 _propertyId,
        string memory _name,
        string memory _symbol,
        address _adminWallet
    ) ERC20(_name, _symbol) Ownable(_adminWallet) {
        require(_adminWallet != address(0), "PropertyToken: admin is zero address");

        propertyId = _propertyId;
        adminWallet = _adminWallet;

        // Mint exactly 100 whole tokens to the admin wallet.
        // Because decimals() returns 0, this is literally 100 units.
        _mint(_adminWallet, 100);
    }

    /**
     * @notice Overrides ERC20 decimals so that tokens are always whole numbers.
     * @return Always 0 — shares cannot be fractional.
     */
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /**
     * @notice Returns the number of property shares owned by ⁠ account ⁠.
     * @dev Thin alias over balanceOf for clearer domain semantics.
     * @param account Address whose share balance to query.
     * @return Number of whole shares held by ⁠ account ⁠.
     */
    function shareOf(address account) external view returns (uint256) {
        return balanceOf(account);
    }
}