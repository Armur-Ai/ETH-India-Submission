import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
export default function Home() {
  const router = useRouter();
  const [clientsigned, setclientsigned] = useState<boolean>(false);
  const [freelancersigned, setfreelancersigned] = useState<boolean>(false);
  const connectWallet = async (type: string) => {
    if ((window as any).ethereum) {
      let provider = (window as any).ethereum?.providers
        ? (window as any).ethereum.providers.find((item: any) => !!item.isMetaMask) ?? (window as any).ethereum
        : (window as any).ethereum;
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      localStorage.setItem("user", type);
      localStorage.setItem("walletaddress", accounts[0]);
      if (accounts && type === "client") {
        const clientsigned = await axios.post("https://api.thegraph.com/subgraphs/name/darahask/nftfree", {
          query: `{
          clients(where: {id: "${accounts[0]}"}) {
            id
          }
        }`,
        });
        if (clientsigned.data.data.clients.length !== 0) {
          router.push("/client/dashboard");
        } else {
          router.push("/signup/clientsignup");
        }
      } else if (accounts && type === "freelancer") {
        const freelancersigned = await axios.post("https://api.thegraph.com/subgraphs/name/darahask/nftfree", {
          query: `{
          freelancers(where: {id: "${accounts[0]}"}) {
            id
          }
        }`,
        });
        if (freelancersigned.data.data.freelancers.length !== 0) {
          router.push("/freelancer/dashboard");
        } else {
          router.push("/signup/freelancersignup");
        }
      }
    }
  };
  return (
    <>
      <Head>
        <title>AUGMNT</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div className={styles.limiter + " h-full"}>
          <div className={styles.containerlogin100}>
            <div className={styles.wraplogin100 + " p-t-30 p-b-50"}>
              <span className={styles.login100formtitle + " p-b-41 p-6"}>WELCOME TO AUGMNT</span>
              <div className={styles.login100form + " "}>
                <div className={styles.logintext + " flex flex-col justify-center items-center font-header uppercase "}>
                  <span>Account login</span>
                </div>
                <div className={" flex flex-col gap-2 p-6 justify-center"}>
                  <div className="text-center justify-center p-4">
                    <button
                      className={styles.input100}
                      onClick={() => {
                        console.log("innn");
                        connectWallet("client");
                      }}
                    >
                      {" "}
                      Client{" "}
                    </button>
                  </div>
                  <div className="text-center justify-center p-4">
                    <button className={styles.input100} onClick={() => connectWallet("freelancer")}>
                      {" "}
                      Freelancer{" "}
                    </button>
                  </div>
                </div>

                <div className={styles.containerlogin100formbtn + " p-4"}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
