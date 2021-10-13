import React, {
  useEffect,
  useState
} from "react";
import {
  ethers
} from "ethers";
import './App.css';
import wavePortal from './utils/WavePortal.json';




const App = () => {

    // used to take input 
    const [text, setText] = useState(" ");
    const handleInput = event => {
      setText(event.target.value);
    };
    const logValue = () => {
      console.log(text);
    };

    const [currentAccount, setCurrentAccount] = useState("");
    /**
     * Create a varaible here that holds the contract address after you deploy!
     */
    const contractAddress = "0x199a748E7cb66647DFD7976e33935fbbd213B410";
    const [allWaves, setAllWaves] = useState([]);

    const checkIfWalletIsConnected = async () => {
      try {
        const {
          ethereum
        } = window;

        if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)
        } else {
          console.log("No authorized account found")
        }
      } catch (error) {
        console.log(error);
      }
    }

    const connectWallet = async () => {
      try {
        const {
          ethereum
        } = window;

        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }

        const accounts = await ethereum.request({
          method: "eth_requestAccounts"
        });

        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.log(error)
      }
    }

    const wave = async () => {
      try {
        const {
          ethereum
        } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);

          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

          const waveTxn = await wavePortalContract.wave(text, {
            gasLimit: 300000
          });
          console.log("Mining...", waveTxn.hash);

          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);

          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
      }
    }

    const getAllWaves = async () => {
      const {
        ethereum
      } = window;

      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);

          const waves = await wavePortalContract.getAllWaves();

          let wavesCleaned = [];
          waves.forEach(wave => {
            wavesCleaned.push({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message
            });
          });

          setAllWaves(wavesCleaned);

          /**
           * Listen in for emitter events!
           */
          wavePortalContract.on("NewWave", (from, timestamp, message) => {
            console.log("NewWave", from, timestamp, message);

            setAllWaves(prevState => [...prevState, {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message
            }]);
          });

        } else {
          console.log("Ethereum object doesn't exist!")
        }
      } catch (error) {
        console.log(error);
      }
    }

    // EIL5 - use effect [] is dependecy array
    // invokes 
    useEffect(() => {
      checkIfWalletIsConnected();
      getAllWaves();
    }, [])



    return ( <
      div className = "mainContainer" >

      <
      div className = "dataContainer" >
      <
      div className = "header" >
      Wall of Love - Ethereum Dapp <
      /div>

      <
      div className = "bio" >
      <
      b > What is the wall of love ? < /b>  The wall of love is a testnet Ethereum Dapp that allows users with a metamask wallet (connected to the Rinkeby testnet) to spread kindness via wall posts!  <
      br > < /br>  <
      br > < /br>  <
      b > Setting up the testnet : < /b>

      <
      a href = "https://www.geeksforgeeks.org/ethereum-blockchain-getting-free-test-ethers-for-rinkeby-test-network/" > Check out how to setup metamask on Rinkeby testnet here < /a>  <
      br > < /br>  <
      br > < /br>
      Also, you have a chance to win .001 Eth when you post a message to the board!
      <
      /div>

      <
      input className = "inputMessage"
      onChange = {
        handleInput
      }
      placeholder = "Insert a message!" / >

      <
      button className = "waveButton"
      onClick = {
        wave
      } >
      POST A MESSAGE <
      /button>

      {
        !currentAccount && ( <
          button className = "waveButton"
          onClick = {
            connectWallet
          } >
          Connect Wallet <
          /button>
        )
      }

      {
        allWaves.map((wave, index) => {
              return ( <
                div className = "waveList" >
                <
                div > < b > From Address: < /b> {wave.address}</div >
                <
                div > < b > Time: < /b> {wave.timestamp.toString()}</div >
                <
                div > < b > Message: < /b> {wave.message}</div >
                <
                /div>)
              })
          } <
          /div>  <
          /div>
      );
    }

    export default App