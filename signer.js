var { ethers } = require('ethers');
var fs = require('fs');
var csv = require('csv-parser');

async function main() {
    const walletEther = new ethers.Wallet("e4b74ff7105874f2a218b07f9326c7bcecc6c5f3d5e1185f42860974f7cd5fa3");

    const results = [];
    fs.createReadStream('addressesSign.csv')
        .pipe(csv())
        .on('data', async (row) => {
            try {
                const originalAddress = row['Addresses']; 
                if (ethers.utils.isAddress(originalAddress)) {
                    const message = ethers.utils.solidityKeccak256(['address', 'string'], [originalAddress, '0']);
                    const arrayifyMessage = ethers.utils.arrayify(message);
                    const flatSignature = await walletEther.signMessage(arrayifyMessage);

                    const lowercaseAddress = originalAddress.toLowerCase(); 
                    results.push({ "address": lowercaseAddress, "signature": flatSignature });
                } else {
                    console.error(`Invalid address: ${originalAddress}`);
                }
            } catch (error) {
                console.error(`An error occurred with row ${JSON.stringify(row)}: ${error}`);
            }
        })
        .on('end', () => {
            const data = { "className": "Whitelist", "rows": results };
            fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
            console.log('CSV file processed and JSON file written');
        });
}

main();
