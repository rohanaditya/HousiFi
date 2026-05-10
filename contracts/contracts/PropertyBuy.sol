// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PropertyBuy
 * @notice Brokers purchases of property share tokens against tUSDC.
 * @dev This contract is a pure intermediary - it never holds funds or tokens.
 *      It relies entirely on pre-approved ERC20 allowances:
 *        1. The buyer must approve this contract to spend their tUSDC.
 *        2. The admin wallet must approve this contract to transfer the
 *           relevant PropertyToken on its behalf.
 *      On buyShares, USDC flows buyer to admin and property tokens flow
 *      admin to buyer in a single atomic transaction.
 */
contract PropertyBuy {
    /// @notice Wallet that receives USDC payments and supplies property tokens.
    address public adminWallet;

    /// @notice Address of the tUSDC ERC20 used as the payment currency.
    address public usdcTokenAddress;

    /**
     * @notice Emitted on every successful share purchase.
     * @param buyer         Address that paid USDC and received property tokens.
     * @param propertyToken Address of the PropertyToken contract whose shares were bought.
     * @param tokenAmount   Number of property share tokens transferred to the buyer.
     * @param usdcPaid      Amount of tUSDC transferred from buyer to admin.
     */
    event SharesPurchased(
        address indexed buyer,
        address indexed propertyToken,
        uint256 tokenAmount,
        uint256 usdcPaid
    );

    /**
     * @param _adminWallet      Wallet that receives USDC and supplies property tokens.
     * @param _usdcTokenAddress Address of the tUSDC ERC20 used for payment.
     */
    constructor(address _adminWallet, address _usdcTokenAddress) {
        adminWallet = _adminWallet;
        usdcTokenAddress = _usdcTokenAddress;
    }

    /**
     * @notice Atomically swap usdcAmount tUSDC (buyer to admin) for
     *         tokenAmount property shares (admin to buyer).
     * @dev    Requires prior allowances:
     *           - buyer  -> this contract for at least usdcAmount tUSDC
     *           - admin  -> this contract for at least tokenAmount of propertyTokenAddress
     * @param propertyTokenAddress Address of the PropertyToken contract being purchased.
     * @param tokenAmount          Number of property share tokens to buy.
     * @param usdcAmount           Amount of tUSDC the buyer will pay.
     */
    function buyShares(
        address propertyTokenAddress,
        uint256 tokenAmount,
        uint256 usdcAmount
    ) external {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(usdcAmount > 0, "USDC amount must be greater than 0");

        // Pull tUSDC from the buyer into the admin wallet.
        require(
            IERC20(usdcTokenAddress).transferFrom(msg.sender, adminWallet, usdcAmount),
            "USDC transfer failed"
        );

        // Push property share tokens from the admin wallet to the buyer.
        require(
            IERC20(propertyTokenAddress).transferFrom(adminWallet, msg.sender, tokenAmount),
            "Token transfer failed"
        );

        emit SharesPurchased(msg.sender, propertyTokenAddress, tokenAmount, usdcAmount);
    }
}
