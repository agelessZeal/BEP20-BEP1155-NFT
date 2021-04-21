// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "@openzeppelin/contracts/presets/ERC20PresetFixedSupply.sol";

contract DWLD is ERC20PresetFixedSupply {
    constructor() ERC20PresetFixedSupply("DWLD", "DWLD",msg.sender,11000000*(10**uint256(decimals()))) {}
}
