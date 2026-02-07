// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AuditLog
 * @dev Stores immutable proof of AuditX compliance reports.
 *      Only stores hashes, no PII.
 */
contract AuditLog {
    
    struct AuditRecord {
        uint8 riskLevel;       // 0 = GREEN, 1 = YELLOW, 2 = RED
        uint256 timestamp;     // Block timestamp
        address auditor;       // Wallet that submitted the audit
    }

    // Mapping from SHA-256 Hash -> Audit Record
    mapping(bytes32 => AuditRecord) public auditRecords;

    // Event for external listeners (Frontend/Graph)
    event AuditStored(
        bytes32 indexed auditHash,
        uint8 riskLevel,
        uint256 timestamp,
        address indexed auditor
    );

    /**
     * @notice Anchors an audit result on-chain.
     * @param _auditHash The SHA-256 hash of the canonical JSON report.
     * @param _riskLevel The compliance risk band (0, 1, or 2).
     */
    function storeAudit(bytes32 _auditHash, uint8 _riskLevel) public {
        require(auditRecords[_auditHash].timestamp == 0, "Audit already exists");

        auditRecords[_auditHash] = AuditRecord({
            riskLevel: _riskLevel,
            timestamp: block.timestamp,
            auditor: msg.sender
        });

        emit AuditStored(_auditHash, _riskLevel, block.timestamp, msg.sender);
    }
}
