const fs = require('fs');
const { web3, ethers } = require('hardhat');
const CONFIG = require("../scripts/credentials.json");
// const nftABI = (JSON.parse(fs.readFileSync('./artifacts/contracts/NFT.sol/NFT.json', 'utf8'))).abi;

contract("NFT deployment", () => {
    let nft;
    let tx;

    const provider = new ethers.providers.JsonRpcProvider(CONFIG["RINKEBY"]["URL"]);
    const signer = new ethers.Wallet(CONFIG["RINKEBY"]["PKEY"]);
    const account = signer.connect(provider);

    before(async () => {
      const NFT = await ethers.getContractFactory("NFT");
      nft = await NFT.deploy("Funky Salamanders", "FUNKY SALAMANDERS", 11,5, 2, 4, "50000000000000000", "50000000000000000",100);
      await nft.deployed();
      //await tx.wait();
      // nftaddr = new ethers.Contract(nft.address, nftABI, account);

      console.log("NFT deployed at address: ",nft.address);
      // console.log(nftaddr.address);

    })

    // after(async () => {
    //     console.log('\u0007');
    //     console.log('\u0007');
    //     console.log('\u0007');
    //     console.log('\u0007');
    // })

    it ("should print contract address", async () => {
      console.log("NFT deployed at address: ",nft.address);
      
    });

    it("Should check for contract's ownership!", async function () {
      console.log(await nft.owner());
      expect(await nft.owner()).to.equal("0xAEf179d178C1A8AdF00DE27c253a9A535d117B52");
    });

    it("Should add whitelisted addresses", async function(){
      tx = await nft.addWhiteListedAddresses([nft.owner()]);
      await tx.wait();
      expect(await nft.isWhiteListed(nft.owner())).to.equal(true);
    });

    it("Should change paused state", async function(){
      await nft.togglePauseState();
      expect(await nft.paused()).to.equal(true);
      await nft.togglePauseState();
    });

    it("Should set not revealed URI", async function(){
      tx = await nft.setNotRevealedURI("NULL");
      await tx.wait();
      expect(await nft.notRevealedUri()).to.equal("NULL");
    });

    it("Should set presale", async function(){
      tx = await nft.togglePreSale();
      await tx.wait();
      expect(await nft.preSaleActive()).to.equal(true);
    });

    it("Should do a presale mint", async function(){
      tx = await nft.preSaleMint(1, {value: ethers.utils.parseEther("0.05")});
      await tx.wait();
      tx = await nft.togglePreSale();
      await tx.wait();
    });

    it("Should set public sale", async function(){
      tx = await nft.togglePublicSale();
      await tx.wait();
      expect(await nft.publicSaleActive()).to.equal(true);
    });

    it("Should do airdrop", async function(){
      tx = await nft.airDrop([nft.owner()]);
      await tx.wait();
      expect(await nft.balanceOf(nft.owner())).to.equal(2);
    });

    it("Should set base URI", async function(){

      tx = await nft.setBaseURI("ipfs://QmYFCe2jBTdooCz5PTutXVU1aMQrecykrNSh559Dmv5YV1/");
      await tx.wait();
      expect(await nft.getURI()).to.equal("ipfs://QmYFCe2jBTdooCz5PTutXVU1aMQrecykrNSh559Dmv5YV1/");
  
    });

    it("Should return tokenURI", async function(){
      expect(await nft.tokenURI(1)).to.equal("NULL");
      tx = await nft.reveal();
      await tx.wait();
      expect(await nft.tokenURI(1)).to.equal("ipfs://QmYFCe2jBTdooCz5PTutXVU1aMQrecykrNSh559Dmv5YV1/1.json");
    });


    // it ("should set correct params for NFT mint", async () => {
		// tx = await nft.setBaseURI("https://ipfs.io/ipfs/");
		// await tx.wait()
		// tx = await nft.setProvenanceHash("PROVENANCE");
		// await tx.wait()
		// // tx = await nft.addWhiteListedAddresses([accounts[1].address, accounts[2].address, accounts[3].address, accounts[4].address]);
    // // await tx.wait()
		// tx = await nft.setPreSale();
    // await tx.wait()
    // tx = await nft.setPublicSale();
    // await tx.wait()
    // tx = await nft.setNotRevealedURI("NULL");
    // await tx.wait()
    // })
})