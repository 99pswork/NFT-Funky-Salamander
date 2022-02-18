const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); 

describe("NFT", function () {

  before(async() =>{
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy("Funky Salamanders", "FUNKY SALAMANDERS", 15, 5, 2, 4, "50000000000000000", "50000000000000000",100);
    await nft.deployed();


    accounts = await ethers.getSigners();
    
  })

  it("Should check for contract's ownership!", async function () {
    expect(await nft.owner()).to.equal(accounts[0].address);
  });

  it("Should set base URI", async function(){

    await nft.setBaseURI("https://ipfs.io/ipfs/");
    expect(await nft.getURI()).to.equal("https://ipfs.io/ipfs/");

  });

  it("Should set provenance hash", async function(){
    await nft.setProvenanceHash("PROVENANCE");
    expect(await nft.NETWORK_PROVENANCE()).to.equal("PROVENANCE");
  });

  it("Should add whitelisted addresses", async function(){
    await nft.addWhiteListedAddresses([accounts[1].address, accounts[2].address, accounts[3].address, accounts[4].address]);
    await nft.addWhiteListedAddressesOG([accounts[5].address, accounts[6].address, accounts[7].address, accounts[8].address]);
    expect(await nft.isWhiteListed(accounts[1].address)).to.equal(true);
    expect(await nft.isWhiteListed(accounts[2].address)).to.equal(true);
    expect(await nft.isWhiteListed(accounts[3].address)).to.equal(true);
    expect(await nft.isWhiteListed(accounts[4].address)).to.equal(true);
    expect(await nft.isWhiteListedOG(accounts[1].address)).to.equal(false);
    expect(await nft.isWhiteListedOG(accounts[2].address)).to.equal(false);
    expect(await nft.isWhiteListedOG(accounts[3].address)).to.equal(false);
    expect(await nft.isWhiteListedOG(accounts[4].address)).to.equal(false);
    expect(await nft.isWhiteListed(accounts[5].address)).to.equal(true);
    expect(await nft.isWhiteListed(accounts[6].address)).to.equal(true);
    expect(await nft.isWhiteListed(accounts[7].address)).to.equal(true);
    expect(await nft.isWhiteListed(accounts[8].address)).to.equal(true);
    expect(await nft.isWhiteListedOG(accounts[5].address)).to.equal(true);
    expect(await nft.isWhiteListedOG(accounts[6].address)).to.equal(true);
    expect(await nft.isWhiteListedOG(accounts[7].address)).to.equal(true);
    expect(await nft.isWhiteListedOG(accounts[8].address)).to.equal(true);
    expect(await nft.isWhiteListed(accounts[9].address)).to.equal(false);
    expect(await nft.isWhiteListed(accounts[10].address)).to.equal(false);
    expect(await nft.isWhiteListed(accounts[11].address)).to.equal(false);
    expect(await nft.isWhiteListed(accounts[12].address)).to.equal(false);
  });

  it("Should change paused state", async function(){
    await nft.togglePauseState();
    expect(await nft.paused()).to.equal(false);
  });

  it("Should set presale", async function(){
    await nft.togglePreSale();
    expect(await nft.preSaleActive()).to.equal(true);
  });

  it("Should set publicsale", async function(){
    await nft.togglePublicSale();
    expect(await nft.publicSaleActive()).to.equal(true);
  });

  it("Should set not revealed URI", async function(){
    await nft.setNotRevealedURI("NULL");
    expect(await nft.notRevealedUri()).to.equal("NULL");
  });

  it("Should do a presale mint", async function(){

    await expect(nft.connect(accounts[9])
    .preSaleMint(10, {value: ethers.utils.parseEther("5.0")}))
    .to.be.revertedWith("NFT:Sender is not whitelisted");

    await nft.connect(accounts[1]).preSaleMint(2, {value: ethers.utils.parseEther("0.1")});
    etherBal = await provider.getBalance(nft.address);
    expect(await nft.balanceOf(accounts[1].address)).to.equal(2);
    expect(etherBal).to.equal(ethers.utils.parseEther("0.1"));

    await expect(nft.connect(accounts[1])
    .preSaleMint(4, {value: ethers.utils.parseEther("0.15")}))
    .to.be.revertedWith("NFT-Public: You can't mint any more tokens");

    await nft.togglePreSale();

    await expect(nft.connect(accounts[2])
      .preSaleMint(10, {value: ethers.utils.parseEther("1.0")}))
      .to.be.revertedWith("NFT:Pre-sale is not active");

    await nft.togglePreSale();

    await nft.connect(accounts[7])
    .preSaleMint(3, {value: ethers.utils.parseEther("0.15")});

    await nft.togglePublicSale();
    //max purchase check
    await expect(nft.connect(accounts[7])
    .preSaleMint(2, {value: ethers.utils.parseEther("0.1")}))
    .to.be.revertedWith("NFT-OG: You can't mint any more tokens");

    expect(await nft.balanceOf(accounts[7].address)).to.equal(3);   
    await nft.togglePublicSale();
  });

  it("Should do a public mint", async function(){

    await expect(nft.connect(accounts[10])
    .publicSaleMint(1, {value: ethers.utils.parseEther("0.005")}))
    .to.be.revertedWith("NFT: Ether value sent for public mint is not correct");

    await nft.connect(accounts[10])
    .publicSaleMint(2, {value: ethers.utils.parseEther("0.1")});

    await nft.connect(accounts[6])
    .publicSaleMint(4, {value: ethers.utils.parseEther("0.2")});

    expect(await nft.balanceOf(accounts[10].address)).to.equal(2);

    etherBal2 = await provider.getBalance(nft.address);
    expect(etherBal2).to.equal(ethers.utils.parseEther(".55"));
  });

  it("Should check for NFT total supply and Max user Purchase", async function(){
    await expect(nft.connect(accounts[6])
    .publicSaleMint(2, {value: ethers.utils.parseEther("60.0")})).to.be.revertedWith("NFT-Public: You can't mint any more tokens");
    await nft.connect(accounts[8])
    .publicSaleMint(1, {value: ethers.utils.parseEther("0.05")});
    await expect(nft.connect(accounts[12])
    .publicSaleMint(8, {value: ethers.utils.parseEther("0.1")}))
    .to.be.revertedWith("NFT: minting would exceed total supply");
    expect(await nft.totalSupply()).to.equal(12);

  });

  it("Should do airdrop", async function(){

    await expect(nft.airDrop([accounts[1].address, accounts[6].address
    , accounts[7].address, accounts[8].address, accounts[9].address]))
    .to.be.revertedWith("NFT: minting would exceed total supply");
    expect(await nft.balanceOf(accounts[2].address)).to.equal(0);
    await nft.airDrop([accounts[2].address, accounts[2].address]);
    expect(await nft.balanceOf(accounts[2].address)).to.equal(2);


  await expect(nft.airDrop([accounts[6].address
      , accounts[7].address, accounts[8].address, accounts[9].address]))
      .to.be.revertedWith("NFT: minting would exceed total supply");

  });

  it("Should return tokenURI", async function(){

    expect(await nft.tokenURI(1)).to.equal("NULL");
    await nft.reveal();
    expect(await nft.tokenURI(1)).to.equal("https://ipfs.io/ipfs/2.json");
  });

  it("Shoud withdraw ETH to Owner's account", async function(){

    bal1 = await provider.getBalance(accounts[0].address);
    await expect(nft.connect(accounts[1])
    .withdraw())
    .to.be.revertedWith("Ownable: caller is not the owner");
    //console.log(await provider.getBalance(nft.address));

    await nft.withdraw();

    contractBal = await provider.getBalance(nft.address);
    expect(contractBal).to.equal(ethers.utils.parseEther("0.0"));

    bal2 = await provider.getBalance(accounts[0].address);
    // console.log(bal2.sub(bal1));
    // console.log("600000000000000000");
    expect(String(bal2.sub(bal1))).to.be.closeTo(ethers.utils.parseEther(".6"), ethers.utils.parseEther("0.01"));
  });
});
