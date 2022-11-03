pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

interface iDeposits {
    function deposits(address) view external returns (uint);
}
