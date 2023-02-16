require("dotenv").config();
const Tx = require("ethereumjs-tx").Transaction;
const Web3 = require("web3");
const ethers = require("ethers");
const adminAddress = process.env.ADMIN_ADDRESS;
const accountUser = process.env.ACCOUNT1_ADDRESS;
const Staking = require("./config/Staking.json");
const { accuCoinContractAddress } = require("./config/accucoin");
const { stakingContractAddress } = require("./config/staking");
const AccuCoin = require("./config/AccuCoin.json");

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://goerli.infura.io/v3/44ba5f98ceea4f71ba411ab8d814e2b6"
  )
);
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const ACCOUNT1_PRIVATE_KEY = process.env.ACCOUNT1_PRIVATE_KEY;
web3.eth.accounts.wallet.add(ADMIN_PRIVATE_KEY);
web3.eth.accounts.wallet.add(ACCOUNT1_PRIVATE_KEY);

//Scripts for getting balance (admin)
const balance = async () => {
  const accuContract = new web3.eth.Contract(
    AccuCoin.abi,
    accuCoinContractAddress
  );
  const balance = await accuContract.methods.balanceOf(adminAddress).call();

  console.log(balance);
};
balance();

//Scripts for transfering ERC20 tokens(AccuCoin Transfer)
const transfer = async () => {
  const accuContract = new web3.eth.Contract(
    AccuCoin.abi,
    accuCoinContractAddress
  );
  const amount = web3.utils.toWei("1", "ether");

  const data = await accuContract.methods
    .transfer(accountUser, amount)
    .encodeABI();
  const nonce = await web3.eth.getTransactionCount(adminAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await accuContract.methods
    .transfer(accountUser, amount)
    .estimateGas({ from: adminAddress });
  const rawTransaction = {
    from: adminAddress,
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: accountUser,
    data: data,
  };

  console.log(rawTransaction);
  const receipt = await web3.eth.sendTransaction(rawTransaction);
  console.log(receipt);
};
transfer();

//Script for staking tokens function
const stake = async () => {
  const stakeContract = new web3.eth.Contract(
    Staking.abi,
    stakingContractAddress
  );
  const accuContract = new web3.eth.Contract(
    AccuCoin.abi,
    accuCoinContractAddress
  );
  const amount = web3.utils.toWei("1", "ether");
  await accuContract.methods
    .approve(accuCoinContractAddress, amount)
    .encodeABI();

  const data = await stakeContract.methods.stake(amount).encodeABI();
  const nonce = await web3.eth.getTransactionCount(adminAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await stakeContract.methods
    .stake(amount)
    .estimateGas({ from: adminAddress });

  const rawTransaction = {
    from: adminAddress,
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: stakingContractAddress,
    data: data,
  };
  console.log(rawTransaction);
  const receipt = await web3.eth.sendTransaction(rawTransaction);
  console.log(receipt);
};
stake();

//Script for unstake tokens
const unStake = async () => {
  const stakeContract = new web3.eth.Contract(
    Staking.abi,
    stakingContractAddress
  );
  const accuContract = new web3.eth.Contract(
    AccuCoin.abi,
    accuCoinContractAddress
  );

  const amount = web3.utils.toWei("1", "ether");
  await accuContract.methods
    .approve(accuCoinContractAddress, amount)
    .encodeABI();

  await stake();
  const data = await stakeContract.methods.unstake(amount).encodeABI();
  const nonce = await web3.eth.getTransactionCount(adminAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await stakeContract.methods
    .unstake(amount)
    .estimateGas({ from: adminAddress });

  const rawTransaction = {
    from: stakingContractAddress,
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: adminAddress,
    data: data,
  };
  console.log(rawTransaction);
  const receipt = await web3.eth.sendTransaction(rawTransaction);
  console.log(receipt);
};
unStake();

//Script for reward tokens &  withdrawing rewards
const claimReward = async () => {
  const stakeContract = new web3.eth.Contract(
    Staking.abi,
    stakingContractAddress
  );
  const accuContract = new web3.eth.Contract(
    AccuCoin.abi,
    accuCoinContractAddress
  );

  const amount = web3.utils.toWei("1", "ether");
  await accuContract.methods
    .approve(accuCoinContractAddress, amount)
    .encodeABI();

  await stake();
  const data = await stakeContract.methods
    .claimReward(adminAddress)
    .encodeABI();
  const nonce = await web3.eth.getTransactionCount(adminAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await stakeContract.methods
    .claimReward(adminAddress)
    .estimateGas({ from: adminAddress });

  const rawTransaction = {
    from: stakingContractAddress,
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: adminAddress,
    data: data,
  };
  console.log(rawTransaction);
  const receipt = await web3.eth.sendTransaction(rawTransaction);
  console.log(receipt);
};
claimReward();

//Script for listing the stakers and a confirm whether an address is a staker
const checkUserStakerStatus = async () => {
  const stakeContract = new web3.eth.Contract(
    Staking.abi,
    stakingContractAddress
  );
  const balance = await stakeContract.methods
    .checkUserStakerStatus(adminAddress)
    .call();
};
checkUserStakerStatus();

//Scripts to fetch the commissions earned by the admin.
const getAdminCommissionDetails = async () => {
  const stakeContract = new web3.eth.Contract(
    Staking.abi,
    stakingContractAddress
  );
  const balance = await stakeContract.methods
    .getAdminCommissionDetails()
    .call();
};
getAdminCommissionDetails();
