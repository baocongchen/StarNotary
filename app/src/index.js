const Web3 = require('web3');
const starNotaryArtifact = require('../../build/contracts/StarNotary.json');

const App = {
  web3: null,
  account: null,
  meta: null,

  async start() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      throw new Error(`Could not connect to contract or chain. ${ error }`);
    }
  },

  setStatus(message) {
    const status = document.getElementById('status');
    status.innerHTML = message;
  },

  async createStar() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById('starName').value;
    const id = document.getElementById('starId').value;
    await createStar(name, id).send({from: this.account});
    App.setStatus(`New Star Owner is ${  this.account  }.`);
  },

  // Implement Task 4 Modify the front end of the DAPP
  async lookUp () {
    const  { lookUptokenIdToStarInfo } = this.meta.methods;
    const id = document.getElementById('lookid').value;
    const starInfo = await lookUptokenIdToStarInfo(id).call();
    if (starInfo) {
      App.setStatus(`Star Info: ${ starInfo }`);
    } else {
      App.setStatus("There's no star that matches the id");
    }
  },

};

window.App = App;

window.addEventListener('load', async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn('No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live',);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'));
  }

  App.start();
});
