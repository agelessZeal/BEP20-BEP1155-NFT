// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract DWLD is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("DWLD", "DWLD") {}
}
