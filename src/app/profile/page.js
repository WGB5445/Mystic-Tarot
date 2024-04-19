"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import NftdataContainer from "../../../components/NftDataContainer";
import Cookies from "js-cookie";
import axios from "axios";
const envcollectionid = "0xed5230f1731b1fdf4a98a63e58007e520b5d9f1ee601b8521eaa186ac79ed177";
const graphqlaptos = "https://api.devnet.aptoslabs.com/v1/graphql";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [nftdata, setnftdata] = useState(null);

  const wallet = Cookies.get("tarot_wallet");

  useEffect(() => {
    const vpnnft = async () => {
      setLoading(true);
      try {
        const wallet = Cookies.get("tarot_wallet");

        const graphqlbody = {
          query: `
            query MyQuery { current_token_datas_v2(where: 
              {collection_id: {_eq: \"${envcollectionid}\"}, 
              current_token_ownerships: 
              {owner_address: {_eq: \"${wallet}\"}}}) 
              { token_name 
                token_uri
                description
                last_transaction_version
               } }
            `,
          operationName: "MyQuery",
        };

        const response = await axios.post(`${graphqlaptos}`, graphqlbody, {
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        });

        console.log("vpn nft", response.data.data.current_token_datas_v2);
        setnftdata(response.data.data.current_token_datas_v2);
      } catch (error) {
        console.error("Error fetching nft data:", error);
      } finally {
        setLoading(false);
      }
    };

    vpnnft();
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between lg:p-24 p-10"
      style={{
        backgroundImage: "url(/tarot_design_dark.png)", // Path to your background image
        backgroundSize: "cover", // Adjust as needed
        backgroundPosition: "center", // Adjust as needed
      }}
    >
      <div className="z-10 lg:max-w-6xl w-full justify-between font-mono text-sm lg:flex md:flex">
        <p
          className="text-white text-xl pb-6 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit rounded-xl p-4"
          style={{
            backgroundColor: "#1F2544",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <Link href="/">
          Tarot Reading
          </Link>
        </p>
        <div
          className="rounded-lg px-2 py-2 lg:mt-0 md:mt-0 mt-4"
          style={{
            backgroundColor: "#F1FFAB",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <Navbar />
        </div>
      </div>

      <NftdataContainer metaDataArray={nftdata} MyReviews={false} />

      {!wallet && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
                {/* <button
                  onClick={() => setques(false)}
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
                </button> */}
              </div>

              <div className="p-4 space-y-4">
                <p className="text-2xl text-center font-bold" style={{color:'#FFB000'}}>
                Please connect your Aptos Wallet
                </p>
              </div>
              <div className="flex items-center p-4 rounded-b pb-20 pt-10">
                <button
                  type="button"
                  className="w-1/2 mx-auto text-black bg-white font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <Navbar />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/5 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow">
              <div className="flex justify-center gap-4">
                <img
                  className="w-50 h-40"
                  src="/loader.gif"
                  alt="Loading icon"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
