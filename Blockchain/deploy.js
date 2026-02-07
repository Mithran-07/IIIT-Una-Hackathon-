const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { Web3 } = require('web3');

// Configuration
const RPC_URL = 'http://127.0.0.1:7545';
const CONTRACT_PATH = path.join(__dirname, 'AuditLog.sol');
const OUTPUT_PATH = path.join(__dirname, 'deployment.json');

async function main() {
    console.log('🚀 AuditX Blockchain Deployment\n');

    // 1. Read contract source
    console.log('📖 Reading contract...');
    const source = fs.readFileSync(CONTRACT_PATH, 'utf8');

    // 2. Compile contract
    console.log('🔨 Compiling Solidity...');
    const input = {
        language: 'Solidity',
        sources: {
            'AuditLog.sol': { content: source }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation errors:', errors);
            process.exit(1);
        }
    }

    const contract = output.contracts['AuditLog.sol']['AuditLog'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    console.log('✅ Compilation successful');

    // 3. Connect to Ganache  
    console.log(`\n🔗 Connecting to ${RPC_URL}...`);
    const web3 = new Web3(RPC_URL); // Web3 v4 syntax

    try {
        const isConnected = await web3.eth.net.isListening();
        if (!isConnected) throw new Error('Not connected');
        console.log('✅ Connected to blockchain');
    } catch (error) {
        console.error('❌ Failed to connect. Is Ganache running on port 7545?');
        console.error('   Run: npm run ganache');
        process.exit(1);
    }

    // 4. Get accounts
    const accounts = await web3.eth.getAccounts();
    console.log(`📝 Deployer account: ${accounts[0]}`);

    // 5. Deploy contract
    console.log('\n📦 Deploying AuditLog contract...');
    const AuditLog = new web3.eth.Contract(abi);

    const deployTx = AuditLog.deploy({
        data: '0x' + bytecode,
        arguments: []
    });

    const gas = await deployTx.estimateGas({ from: accounts[0] });
    console.log(`⛽ Estimated gas: ${gas}`);

    const auditLogInstance = await deployTx.send({
        from: accounts[0],
        gas: Number(gas) + 100000 // Add buffer
    });

    const contractAddress = auditLogInstance.options.address;
    console.log(`✅ Contract deployed at: ${contractAddress}`);

    // 6. Save deployment info
    const deployment = {
        address: contractAddress,
        abi: abi,
        deployer: accounts[0],
        network: 'local',
        rpc_url: RPC_URL,
        deployed_at: new Date().toISOString()
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(deployment, null, 2));
    console.log(`\n💾 Deployment saved to: ${OUTPUT_PATH}`);

    // 7. Test contract
    console.log('\n🧪 Testing contract...');
    const testHash = web3.utils.sha3('test-audit-data');
    const tx = await auditLogInstance.methods.storeAudit(testHash, 0).send({
        from: accounts[0]
    });
    console.log(`✅ Test transaction: ${tx.transactionHash}`);

    const record = await auditLogInstance.methods.auditRecords(testHash).call();
    console.log(`✅ Verified: Risk Level = ${record.riskLevel}, Timestamp = ${record.timestamp}`);

    console.log('\n🎉 Blockchain setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Keep Ganache running in a separate terminal');
    console.log('   2. Backend will automatically use this contract');
    console.log('   3. Upload a file to see blockchain anchoring in action!');
}

main().catch(console.error);
