import hashlib
import json
import os
from typing import Dict, Any, Optional, List
from datetime import datetime

# Blockchain Config
ETH_RPC_URL = os.getenv("ETH_RPC_URL", "http://127.0.0.1:7545")
# Point to peer directory (assuming CWD is auditx-backend)
DEPLOYMENT_FILE = os.path.abspath(os.path.join(os.getcwd(), "../blockchain/deployment.json"))

class BlockchainLedger:
    _instance = None
    _chain = [] # Local in-memory chain (persisted to file in real app, simplified for demo)
    _web3 = None
    _contract = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BlockchainLedger, cls).__new__(cls)
            cls._instance._init_ethereum()
        return cls._instance

    def _init_ethereum(self):
        """Try to connect to Ethereum if available."""
        try:
            from web3 import Web3
            self._web3 = Web3(Web3.HTTPProvider(ETH_RPC_URL))
            
            if self._web3.is_connected() and os.path.exists(DEPLOYMENT_FILE):
                with open(DEPLOYMENT_FILE, "r") as f:
                    data = json.load(f)
                    self._contract = self._web3.eth.contract(
                        address=data["address"],
                        abi=data["abi"]
                    )
                print(f"✅ Ethereum Connected: {ETH_RPC_URL}")
            else:
                self._web3 = None # Explicitly none if connection failed or contract missing
                # Silent failure is okay here as per fail-safe requirement
        except Exception as e:
            print(f"⚠️  Blockchain Init Error: {e}")
            self._web3 = None

    def add_block(self, audit_id: str, audit_data: Dict[str, Any]) -> str:
        """
        Adds audit to local chain AND computes hash.
        Returns SHA-256 hash.
        """
        # 1. Canonical Hash
        audit_string = json.dumps(audit_data, sort_keys=True, default=str)
        audit_hash = hashlib.sha256(audit_string.encode()).hexdigest()

        # 2. Local Chain (Append)
        prev_hash = self._chain[-1]["current_hash"] if self._chain else "GENESIS_BLOCK_0000000000000000"
        
        block = {
            "index": len(self._chain) + 1,
            "timestamp": datetime.now().isoformat(),
            "audit_id": audit_id,
            "previous_hash": prev_hash,
            "current_hash": audit_hash
        }
        self._chain.append(block)
        
        return audit_hash

    def store_on_chain(self, audit_hash: str, risk_band: str) -> Dict[str, Any]:
        """
        Anchors the hash to Ethereum. Fail-safe.
        """
        if not self._web3 or not self._contract:
            return {"status": "OFFLINE", "reason": "Node/Contract unavailable"}

        try:
            # Risk Mapping: 0=GREEN, 1=YELLOW, 2=RED
            risk_map = {"GREEN": 0, "YELLOW": 1, "RED": 2}
            risk_int = risk_map.get(risk_band, 2) # Default RED if unknown

            # Convert hex string to bytes32
            # 0x prefix might be needed or not depending on input. 
            # audit_hash is hexdigest (no 0x). 
            if not audit_hash.startswith("0x"):
                hash_bytes = bytes.fromhex(audit_hash)
            else:
                hash_bytes = bytes.fromhex(audit_hash[2:])

            # Transaction
            # Hackathon: Use first account from Ganache
            account = self._web3.eth.accounts[0]
            
            tx_hash = self._contract.functions.storeAudit(
                hash_bytes,
                risk_int
            ).transact({'from': account})
            
            # Wait for receipt
            receipt = self._web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "status": "ONLINE",
                "tx_hash": receipt.transactionHash.hex(),
                "block_number": receipt.blockNumber,
                "explorer_url": f"http://127.0.0.1:7545/tx/{receipt.transactionHash.hex()}" # Ganache local
            }
        except Exception as e:
            print(f"❌ Blockchain Transaction Failed: {e}")
            return {"status": "ERROR", "error": str(e)}

    def get_chain(self):
        return self._chain

# Global Instance
ledger = BlockchainLedger()

def generate_audit_hash(audit_data: Dict[str, Any]) -> str:
    """Wrapper for backward compatibility."""
    audit_string = json.dumps(audit_data, sort_keys=True, default=str)
    return hashlib.sha256(audit_string.encode()).hexdigest()
