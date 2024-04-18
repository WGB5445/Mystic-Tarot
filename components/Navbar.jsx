"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useKeylessAccounts } from "../src/app/lib/useKeylessAccounts";
import { collapseAddress } from "../src/app/lib/utils";
import useAptos from "./context/useAptos";
import {Account} from '@aptos-labs/ts-sdk';
import GoogleLogo from "../components/GoogleLogo";

const REACT_APP_GATEWAY_URL = "https://gateway.netsepio.com/";

const Navbar = () => {
  const wallet = Cookies.get("tarot_wallet");

  const { aptos, moduleAddress } = useAptos();

  const { activeAccount, disconnectKeylessAccount } = useKeylessAccounts();
  console.log("activeAccount", activeAccount);

  const [hovered, setHovered] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loginbox, setloginbox] = useState(false);

  const logout = {
    color: hovered ? "red" : "black",
  };

  const getAptosWallet = () => {
    if ("aptos" in window) {
      return window.aptos;
    } else {
      window.open("https://petra.app/", "_blank");
    }
  };

  const connectWallet = async () => {
    const aptosWallet = getAptosWallet();
    try {
      const response = await aptosWallet.connect();
      console.log(response); // { address: string, publicKey: string }
      // Check the connected network
      const network = await aptosWallet.network();
      if (network === "Devnet") {

        // signing message
        const payload = {
          message: "Hello from Aptos Tarot",
          nonce: Math.random().toString(16),
        };
        const res = await aptosWallet.signMessage(payload);
        // signing message

        Cookies.set("tarot_wallet", response.address, { expires: 7 });
        window.location.reload();
      } else {
        alert(`Switch to Devnet in your Petra wallet`);
      }
    } catch (error) {
      console.error(error); // { code: 4001, message: "User rejected the request."}
    }
  };

  const handleDeleteCookie = () => {
    Cookies.remove("tarot_wallet");
    window.location.href = "/";
  };

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


  const signmessage = async () => {
    try {

    const balance = async (
      name,
      accountAddress,
     ) => {
      const amount = await aptos.getAccountAPTAmount({
        accountAddress,
      });
      console.log(`${name}'s balance is: ${amount}`);
      return amount;
    };

      const bob = Account.generate();

      await aptos.fundAccount({
        accountAddress: activeAccount.accountAddress,
        amount: 100_000_000,
      });      

      const transaction = await aptos.transferCoinTransaction({
          sender: activeAccount.accountAddress,
          recipient: bob.accountAddress,
          amount: 100,
      });
  
      const committedTxn = await aptos.signAndSubmitTransaction({ signer: activeAccount, transaction });
  
      const committedTransactionResponse = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

      const senderBalance = await balance("Alice", activeAccount.accountAddress);
      const recieverBalance = await balance("Bob", bob.accountAddress);
  
      console.log("Transaction submitted successfully:", committedTransactionResponse);
    } catch (error) {
      console.error("Error signing and submitting transaction:", error);
    }
  };

  return (
    <div>
    {!wallet && !activeAccount && (
<button onClick={()=>{setloginbox(true)}} className="px-10 py-2 text-xl">Login</button>
      )}

      {wallet && (
          <div className="flex gap-4">
          <Link href="/profile">{avatarUrl && <img src={avatarUrl} alt="Avatar" style={{width: 45}}/>} </Link>
          <div>
          <div className="text-black rounded-lg text-xl font-bold text-center">
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </div>
          <button
            onClick={handleDeleteCookie}
            style={logout}
            className="mx-auto hover:text-red-400 text-black text-xl font-bold"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            Logout
          </button>
          </div>
          </div>
      )}

{activeAccount && !wallet ? (
  <>
              <div onClick={disconnectKeylessAccount} className="flex justify-center items-center gap-4 rounded-lg px-4 cursor-not-allowed font-semibold">
                <GoogleLogo />
                {collapseAddress(activeAccount?.accountAddress.toString())}
              </div>
              <button onClick={signmessage}>Sign message</button>
              </>
            ): (<></>)}

{ loginbox && (

<div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
                <button
                  onClick={() => setloginbox(false)}
                  type="button"
                  className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* <Image src={emoji} alt="info" className="mx-auto"/> */}

              <div className="p-4 space-y-4">
                <p className="text-3xl text-center font-bold text-green-500">
                Login Options
                </p>
              </div>
              <div className="flex justify-center p-4 pb-10">
              <button className="text-black px-6 py-2 bg-white" style={{borderRadius:'10px'}} 
              onClick={connectWallet}>
              Connect with Petra
              </button>
                    </div>
                    <div className="flex justify-center p-4 pb-20">
              <div className="text-black px-8 py-2 bg-white" style={{borderRadius:'10px'}}>
                    <Link href={'/login'}>Login with google</Link >
                </div>
              </div>
            </div>
          </div>
        </div>
  )}
    </div>
  );
};

export default Navbar;
