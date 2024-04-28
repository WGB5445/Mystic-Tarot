"use client";
import axios from "axios";
import React, { useEffect} from "react";
import Link from "next/link";
import {generateNonce, generateRandomness} from '@mysten/zklogin';
import {useSui} from "../src/app/hooks/useSui";
import {useLayoutEffect, useState} from "react";
import {UserKeyData} from "../src/app/types/UsefulTypes";
import {Ed25519Keypair} from '@mysten/sui.js/keypairs/ed25519';
import {Keypair, PublicKey} from "@mysten/sui.js/cryptography";

import { ConnectButton, useCurrentAccount,  useCurrentWallet, useAccounts } from '@mysten/dapp-kit';
const Navbar = () => {





  
  const {suiClient} = useSui();

  const [loginUrl, setLoginUrl] = useState<string | null>();

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



  
 
  const { currentWallet, connectionStatus } = useCurrentWallet()

  if (connectionStatus === 'connected' && currentWallet.accounts.length > 0) {
  console.log('Connected Wallet Address:', currentWallet.accounts[0].address);
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
    </div>
  );
};

export default Navbar;
