import json
import os
from web3 import Web3
from solcx import compile_source, install_solc

# Ensure strict consistency with prompt instructions
# Default Ganache URL
RPC_URL = os.getenv("ETH_RPC_URL", "http://127.0.0.1:7545")

def deploy():
    print(f"Connecting to Ethereum node at {RPC_URL}...")
    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        print("❌ Failed to connect to Ethereum node.")
        print("   Make sure Ganache is running on port 7545.")
        return

    print("✅ Connected to Blockchain.")

    # Install solc if needed (using user's python environment)
    try:
        install_solc('0.8.0')
    except Exception as e:
        print(f"⚠️  Solc install issue (might be already installed): {e}")

    # Read Contract Source
    with open("blockchain/AuditLog.sol", "r") as f:
        source = f.read()

    # Compile
    print("Compiling AuditLog.sol...")
    compiled_sol = compile_source(
        source,
        output_values=['abi', 'bin'],
        solc_version='0.8.0'
    )
    
    contract_id, contract_interface = next(iter(compiled_sol.items())) # Get first contract
    bytecode = contract_interface['bin']
    abi = contract_interface['abi']

    # Deploy
    # Use first account from Ganache as deployer
    deployer_account = w3.eth.accounts[0]
    print(f"Deploying from account: {deployer_account}")

    AuditLog = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx_hash = AuditLog.constructor().transact({'from': deployer_account})
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print("-" * 30)
    print(f"🚀 Contract Deployed!")
    print(f"📍 Address: {tx_receipt.contractAddress}")
    print("-" * 30)
    
    # Save ABI and Address for backend usage
    deployment_data = {
        "address": tx_receipt.contractAddress,
        "abi": abi
    }
    
    with open("blockchain/deployment.json", "w") as f:
        json.dump(deployment_data, f, indent=2)
        
    print("💾 Deployment details saved to blockchain/deployment.json")
    print("👉 Set this address in your .env file or backend config.")

if __name__ == "__main__":
    deploy()
