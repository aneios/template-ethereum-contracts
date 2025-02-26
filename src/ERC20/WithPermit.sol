// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.8.22;

import "./ERC20Internal.sol";
import "../Interfaces/IERC2612Standalone.sol";

abstract contract WithPermit is ERC20Internal, IERC2612Standalone {
	bytes32 internal constant PERMIT_TYPEHASH =
		keccak256(
			"Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
		);
	mapping(address => uint256) internal _nonces;

	function DOMAIN_SEPARATOR() public view virtual override returns (bytes32);

	function nonces(address owner) external view override returns (uint256) {
		return _nonces[owner];
	}

	function permit(
		address owner,
		address spender,
		uint256 value,
		uint256 deadline,
		uint8 v,
		bytes32 r,
		bytes32 s
	) external override {
		require(owner != address(0), "INVALID_ZERO_ADDRESS");

		uint256 currentNonce = _nonces[owner];
		bytes32 digest = keccak256(
			abi.encodePacked(
				"\x19\x01",
				DOMAIN_SEPARATOR(),
				keccak256(
					abi.encode(PERMIT_TYPEHASH, owner, spender, value, currentNonce, deadline)
				)
			)
		);
		require(owner == ecrecover(digest, v, r, s), "INVALID_SIGNATURE");
		require(deadline == 0 || block.timestamp <= deadline, "TOO_LATE");

		_nonces[owner] = currentNonce + 1;
		_approveFor(owner, spender, value);
	}
}
