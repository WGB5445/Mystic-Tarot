"use client";
import axios from "axios";
import React, { useEffect} from "react";
import Link from "next/link";
import {generateNonce, generateRandomness} from '@mysten/zklogin';
import {useSui} from "../src/app/hooks/useSui";
import {useLayoutEffect, useState} from "react";
import {Ed25519Keypair} from '@mysten/sui.js/keypairs/ed25519';
import {Keypair, PublicKey} from "@mysten/sui.js/cryptography";
import {TransactionBlock} from "@mysten/sui.js/transactions";
import {fromB64} from "@mysten/bcs";
import {GetSaltRequest, LoginResponse, UserKeyData, ZKPPayload, ZKPRequest} from "../src/app/types/UsefulTypes";
import  jwtDecode  from "jwt-decode";
import {genAddressSeed, getZkLoginSignature, jwtToAddress} from '@mysten/zklogin';

import { ConnectButton, useCurrentAccount,  useCurrentWallet, useAccounts } from '@mysten/dapp-kit';
const Navbar = () => {





  
  const {suiClient} = useSui();

  const [loginUrl, setLoginUrl] = useState<string | null>();
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [subjectID, setSubjectID] = useState<string | null>(null);
  const [jwtEncoded, setJwtEncoded] = useState<string | null>(null);
  const [autheticated,setautheticated] = useState<boolean>(false);

  async function prepareLogin() {
      const {epoch, epochDurationMs, epochStartTimestampMs} = await suiClient.getLatestSuiSystemState();


      const maxEpoch = parseInt(epoch) + 2; // this means the ephemeral key will be active for 2 epochs from now.
      const ephemeralKeyPair : Keypair = new Ed25519Keypair();
      const ephemeralPrivateKeyB64 = ephemeralKeyPair.export().privateKey;


      const ephemeralPublicKey : PublicKey = ephemeralKeyPair.getPublicKey()
      const ephemeralPublicKeyB64 = ephemeralPublicKey.toBase64();

      const jwt_randomness = generateRandomness();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, jwt_randomness);

      console.log("current epoch = " + epoch);
      console.log("maxEpoch = " + maxEpoch);
      console.log("jwt_randomness = " + jwt_randomness);
      console.log("ephemeral public key = " + ephemeralPublicKeyB64);
      console.log("nonce = " + nonce);

      const userKeyData: UserKeyData = {
          randomness: jwt_randomness.toString(),
          nonce: nonce,
          ephemeralPublicKey: ephemeralPublicKeyB64,
          ephemeralPrivateKey: ephemeralPrivateKeyB64,
          maxEpoch: maxEpoch
      }
      localStorage.setItem("userKeyData", JSON.stringify(userKeyData));
      return userKeyData
  }


  function getRedirectUri() {
      const protocol = window.location.protocol;
      const host = window.location.host;
      const customRedirectUri = protocol + "//" + host + "/";
      console.log("customRedirectUri = " + customRedirectUri);
   
      return customRedirectUri;
  }

  useLayoutEffect(() => {

      prepareLogin().then((userKeyData) => {

          const REDIRECT_URI = 'https://zklogin-dev-redirect.vercel.app/api/auth';
          const customRedirectUri = getRedirectUri();
          const params = new URLSearchParams({
              // When using the provided test client ID + redirect site, the redirect_uri needs to be provided in the state.
              state: new URLSearchParams({
                  redirect_uri: customRedirectUri
              }).toString(),
              // Test Client ID for devnet / testnet:
              client_id: '595966210064-3nnnqvmaelqnqsmq448kv05po362smt2.apps.googleusercontent.com',
              redirect_uri: REDIRECT_URI,
              response_type: 'id_token',
              scope: 'openid',
              nonce: userKeyData.nonce,
          });

          setLoginUrl(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
      });


  }, []);

  async function getSalt(subject: string, jwtEncoded: string) {
    const getSaltRequest: GetSaltRequest = {
        subject: subject,
        jwt: jwtEncoded!
    }
    console.log("Getting salt...");
    console.log("Subject = ", subject);
    console.log("jwt = ", jwtEncoded);
    const response = await axios.post('/api/userinfo/get/salt', getSaltRequest);
    console.log("getSalt response = ", response);
    if (response?.data.status == 200) {
        const userSalt = response.data.salt;
        console.log("Salt fetched! Salt = ", userSalt);
        return userSalt;
    } else {
        console.log("Error Getting SALT");
        return null;
    }
}


  async function loadRequiredData(encodedJwt: string) {
    //Decoding JWT to get useful Info
    const decodedJwt: LoginResponse = await jwtDecode(encodedJwt!) as LoginResponse;

    setSubjectID(decodedJwt.sub);
    //Getting Salt
    const userSalt = await getSalt(decodedJwt.sub, encodedJwt);
    if (!userSalt) {
        console.log("Error getting userSalt");
        return;
    }

    //Generating User Address
    const address = jwtToAddress(encodedJwt!, BigInt(userSalt!));

    setUserAddress(address);
    setUserSalt(userSalt!);
    const hasEnoughBalance = await checkIfAddressHasBalance(address);
    if(!hasEnoughBalance){
        await giveSomeTestCoins(address);
        console.log("We' ve fetched some coins for you, so you can get started with Sui !", {   duration: 8000,} );
    }

    console.log("All required data loaded. ZK Address =", address);
 
}

useLayoutEffect(() => {
  if (typeof window !== 'undefined') {
  // setError(null);
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const jwt_token_encoded = hash.get("id_token");

  const userKeyData: UserKeyData = JSON.parse(localStorage.getItem("userKeyData")!);

  if (!jwt_token_encoded) {
      console.log("Could not retrieve a valid JWT Token!")
      return;
  }

  if (!userKeyData) {
      console.log("user Data is null");
      return;
  }
  localStorage.setItem("id_token", jwt_token_encoded);
  setautheticated(localStorage.getItem("id_token")!==null)
  setJwtEncoded(jwt_token_encoded);

  loadRequiredData(jwt_token_encoded);
}
 

}, []);

if (typeof window !== 'undefined') {
  console.log("localstorage", localStorage.getItem("id_token"))
  console.log("boolean", localStorage.getItem("id_token")!==null)
 
}
  
 
  const { currentWallet, connectionStatus } = useCurrentWallet()

  if (connectionStatus === 'connected' && currentWallet.accounts.length > 0) {
  console.log('Connected Wallet Address:', currentWallet.accounts[0].address);
  }


  async function checkIfAddressHasBalance(address: string): Promise<boolean> {
    console.log("Checking whether address " + address + " has balance...");
    const coins = await suiClient.getCoins({
        owner: address,
    });
    //loop over coins
    let totalBalance = 0;
    for (const coin of coins.data) {
        totalBalance += parseInt(coin.balance);
    }
    totalBalance = totalBalance / 1000000000;  //Converting MIST to SUI
    setUserBalance(totalBalance);
    console.log("total balance = ", totalBalance);
    return enoughBalance(totalBalance);
  }
  
  function enoughBalance(userBalance: number) {
    return userBalance > 0.003;
  }

  function getTestnetAdminSecretKey() {
    return process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY;
  }
  
  
  async function giveSomeTestCoins(address: string) {
    // setError(null);
    console.log("Giving some test coins to address " + address);
    // setTransactionInProgress(true);
    const adminPrivateKey = getTestnetAdminSecretKey();
    if (!adminPrivateKey) {
        console.log("Admin Secret Key not found. Please set NEXT_PUBLIC_ADMIN_SECRET_KEY environment variable.");
        return
    }
    let adminPrivateKeyArray = Uint8Array.from(Array.from(fromB64(adminPrivateKey)));
    const adminKeypair = Ed25519Keypair.fromSecretKey(adminPrivateKeyArray.slice(1));
    const tx = new TransactionBlock();
    const giftCoin = tx.splitCoins(tx.gas, [tx.pure(30000000)]);
  
    tx.transferObjects([giftCoin], tx.pure(address));
  
    const res = await suiClient.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: adminKeypair,
        requestType: "WaitForLocalExecution",
        options: {
            showEffects: true,
        },
    });
    const status = res?.effects?.status?.status;
    if (status === "success") {
        console.log("Gift Coin transfer executed! status = ", status);
        checkIfAddressHasBalance(address);
        // setTransactionInProgress(false);
    }
    if (status == "failure") {
        console.log("Gift Coin transfer Failed. Error = " + res?.effects);
    }
  }


  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getRandomNumber = () => Math.floor(Math.random() * 1000);
        const apiUrl = `https://api.multiavatar.com/${getRandomNumber()}`;

        const response = await axios.get(apiUrl);
        const svgDataUri = `data:image/svg+xml,${encodeURIComponent(response.data)}`;
        setAvatarUrl(svgDataUri);
      } catch (error) {
        console.error('Error fetching avatar:', error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="flex gap-4">
          <Link href="/profile">{avatarUrl && currentWallet && <img src={avatarUrl} alt="Avatar" style={{width: 45}}/>} </Link>

          <div className="flex flex-col text-white">
          <ConnectButton connectText = "Connect with Sui"/>
          {connectionStatus === 'connected' && (
            <div className="flex gap-4 mx-auto">
              Wallet Address :
                  {currentWallet.accounts.map((account) => (
                    <div>{account.address.slice(0, 4)}...{account.address.slice(-3)}</div>
                  ))}
            </div>
          )}
          </div>

          </div>

            {userAddress ? (
                        <div className="">
                            <dd className="pt-4 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                <span className="text-white">{userBalance.toFixed(4)} SUI</span>
                                <span className="ml-5">
                                <button
                                    type="button"
                                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    disabled={!userAddress}
                                    onClick={() => giveSomeTestCoins(userAddress!)}
                                >
                                        Get Testnet Coins
                                    </button>
                            </span>
                            </dd>
                        </div>
                    ) : (
                      <div className="flex mt-4 mb-10 space-x-4 justify-center">
                <a href={loginUrl!}
                   className="hover:text-blue-600"
                   target="_blank">

                    <button
                        className="bg-white text-gray-700 hover:text-gray-900 font-semibold py-2 px-4 border rounded-lg flex items-center space-x-2">
                        
                        <span>Login with Google</span>
                    </button>
                </a>

            </div>
                    )}
    </div>
  );
};

export default Navbar;
