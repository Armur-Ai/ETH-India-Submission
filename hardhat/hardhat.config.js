require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan")
require('dotenv').config()

POLYGON_TEST_RPC_URL = process.env.POLYGON_TEST_RPC_URL
PRIVATE_POLYGON_TEST_KEY = process.env.PRIVATE_POLYGON_TEST_KEY
POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks:{
    hardhat:{
      chainId: 31337
    },
    polygontest:{
      chainId: 80001,
      url: POLYGON_TEST_RPC_URL,
      accounts:[PRIVATE_POLYGON_TEST_KEY]
    }
  },
  etherscan:{
    apiKey: POLYGONSCAN_API_KEY
  }
};
