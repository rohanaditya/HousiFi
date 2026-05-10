// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PropertySell
 * @notice Brokers redemptions of property share tokens back to the admin in exchange for tUSDC.
 * @dev This contract is a pure intermediary — it never holds funds or tokens.
 *      It relies entirely on pre-approved ERC20 allowances:
 *        1. The seller must approve this contract to transfer their property tokens.
 *        2. The admin wallet must approve this contract to spend its tUSDC.
 *      On ⁠ sellShares ⁠, property tokens flow seller → admin and tUSDC flows
 *      admin → seller in a single atomic transaction.
 */
contract PropertySell {
    /// @notice Wallet that receives redeemed property tokens and supplies the USDC payout.
    address public adminWallet;

    /// @notice Address of the tUSDC ERC20 used as the payout currency.
    address public usdcTokenAddress;

    /**
     * @notice Emitted on every successful share sale.
     * @param seller        Address that returned property tokens and received USDC.
     * @param propertyToken Address of the PropertyToken contract whose shares were sold.
     * @param tokenAmount   Number of property share tokens transferred back to the admin.
     * @param usdcReceived  Amount of tUSDC paid out to the seller.
     */
    event SharesSold(
        address indexed seller,
        address indexed propertyToken,
        uint256 tokenAmount,
        uint256 usdcReceived
    );

    /**
     * @param _adminWallet      Wallet that receives property tokens and supplies USDC payouts.
     * @param _usdcTokenAddress Address of the tUSDC ERC20 used for payouts.
     */
    constructor(address _adminWallet, address _usdcTokenAddress) {
        adminWallet = _adminWallet;
        usdcTokenAddress = _usdcTokenAddress;
    }

    /**
     * @notice Atomically swap ⁠ tokenAmount ⁠ property shares (seller → admin) for
     *         ⁠ usdcPayout ⁠ tUSDC (admin → seller).
     * @dev    Requires prior allowances:
     *           - seller → this contract for at least ⁠ tokenAmount ⁠ of ⁠ propertyTokenAddress ⁠
     *           - admin  → this contract for at least ⁠ usdcPayout ⁠ tUSDC
     * @param propertyTokenAddress Address of the PropertyToken contract being redeemed.
     * @param tokenAmount          Number of property share tokens to sell back.
     * @param usdcPayout           Amount of tUSDC the seller will receive.
     */
    function sellShares(
        address propertyTokenAddress,
        uint256 tokenAmount,
        uint256 usdcPayout
    ) external {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(usdcPayout > 0, "USDC payout must be greater than 0");

        // Pull property share tokens from the seller back to the admin wallet.
        require(
            IERC20(propertyTokenAddress).transferFrom(msg.sender, adminWallet, tokenAmount),
            "Token transfer failed"
        );

        // Push tUSDC from the admin wallet to the seller.
        require(
            IERC20(usdcTokenAddress).transferFrom(adminWallet, msg.sender, usdcPayout),
            "USDC transfer failed"
        );

        emit SharesSold(msg.sender, propertyTokenAddress, tokenAmount, usdcPayout);
    }
}