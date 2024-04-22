"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {useWallet} from '@suiet/wallet-kit';
import {ConnectButton} from '@suiet/wallet-kit';

const Navbar = () => {

  const {status, connected, connecting , account , network, name} = useWallet();
  const wallet = account?.address;
console.log("my sui wallet", wallet);

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
          <Link href="/profile">{avatarUrl && wallet && <img src={avatarUrl} alt="Avatar" style={{width: 45}}/>} </Link>
          <ConnectButton label="Connect with sui"/>
          </div>
    </div>
  );
};

export default Navbar;
