const { ethers } = require('ethers');

async function test() {
    const user = '0x1234567890123456789012345678901234567890';
    const quizId = 'DAO Foundations';
    const amount = ethers.utils.parseUnits('10', 18);
    const privKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    const wallet = new ethers.Wallet(privKey);
    const signer = wallet.address;

    console.log('Signer:', signer);

    // Backend way
    const messageHash = ethers.utils.solidityKeccak256(
        ["address", "string", "uint256"],
        [user, quizId, amount]
    );
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    console.log('Signature:', signature);

    // Contract way (solidityPack matches abi.encodePacked)
    const contractMessageHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
            ["address", "string", "uint256"],
            [user, quizId, amount]
        )
    );
    
    // contractMessageHash should match messageHash
    console.log('Hashes match:', messageHash === contractMessageHash);

    const ethSignedHash = ethers.utils.hashMessage(ethers.utils.arrayify(messageHash));
    const recovered = ethers.utils.recoverAddress(ethSignedHash, signature);
    console.log('Recovered:', recovered);
    console.log('Success:', recovered === signer);
}

test();
