import { SelectChangeEvent, Theme, useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import clientABI from "../../../src/abi/client-abi.json";
import ClientDashboardStyles from "./clientdashboard.module.scss";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import axios from "axios";
import Web3 from "web3";
import { Chat } from "@pushprotocol/uiweb";
import tokenABI from "../../../src/abi/token-abi.json";

export default function ClientDashboard() {
  const router = useRouter();
  const [username, setUserName] = useState<string>("");
  const [avatars, setAvatar] = useState<string>("");
  const [itemid, setitemid] = useState<number>();
  const [useraccount, setUserAccount] = useState<string>("");
  const [enableChat, setenableChat] = useState<boolean>(false);
  const [approvEn, setapprovEn] = useState<boolean>(false);
  const [projectsCmpl, setprojectsCmpl] = useState([""]);
  function getStyles(name: string, personName: string[], theme: Theme) {
    return {
      fontWeight: personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
    };
  }
  const theme = useTheme();
  const [personName, setPersonName] = useState<string[]>([]);
  const web3 = new Web3(
    Web3.givenProvider || "https://cool-tiniest-gadget.ethereum-goerli.discover.quiknode.pro/246364df7cda3039117bdc419267d7a7f37110f4/"
  );
  const nftaddress = "0x30ede7289d52412c22b78741e78BB153A4EF6b07";
  const tokenaddress = "0x54fc29154Dc49D36d58A18A8fD035182EB3BB3a1";
  const [projectdetails, setProjectDetails] = useState([
    {
      projectName: "",
      project_cost: 0,
      description: "",
      freelancer: "",
      id: "",
      sold: false,
    },
  ]);
  const handleclick = (type: string) => {
    if (type === "createproject") {
      router.push("/client/dashboard/createproject");
    } else if (type === "projects") {
      router.push("/client/dashboard");
    }
  };
  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };
  const getNameAddress = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://cool-tiniest-gadget.ethereum-goerli.discover.quiknode.pro/246364df7cda3039117bdc419267d7a7f37110f4/"
    );
    let address = localStorage.getItem("walletaddress");
    let names = await provider.lookupAddress(address!);
    if (names) {
      let avatarimage = await provider.getAvatar(names!);
      setAvatar(avatarimage!);
    }
    setUserName(names! ?? address);
  };
  const getProjects = async () => {
    const accounts = await web3.eth.getAccounts();
    setUserAccount(accounts[0]);
    const projects = await axios.post("https://api.thegraph.com/subgraphs/name/darahask/nftfree", {
      query: `{
        listings(where: {client: "${accounts[0]}"}) {
          project_cost
          id
          freelancer
          sold
        }
      }`,
    });
    let totalprojects = projects.data.data.listings;
    const nftcontract = await new web3.eth.Contract(clientABI as [], nftaddress);
    for (let i = 0; i < totalprojects.length; i++) {
      let data = await nftcontract.methods.tokenURI(totalprojects[i].id).call();
      if (data != "" && data.includes("ipfs")) {
        const dats = data.split(":/").join("");
        console.log(dats, i, "data");
        const nftData = `https://nftstorage.link/${dats}`;
        const response = await fetch(nftData);
        const json = await response.json();
        totalprojects[i].projectName = json.projectName;
        totalprojects[i].description = json.description;
      } else {
        totalprojects[i].projectName = "New project";
        totalprojects[i].description = "Project on NFT";
      }
    }
    setProjectDetails(totalprojects);
  };
  const approveBuy = async (id: any, freelanceradd: any, price: any) => {
    const accounts = await web3.eth.getAccounts();
    console.log(price);
    const tokencontract = await new web3.eth.Contract(tokenABI as [], tokenaddress);
    let tx: any = {
      from: accounts[0],
      to: tokenaddress,
      data: tokencontract.methods.approve(nftaddress, price + 1).encodeABI(),
    };
    await web3.eth
      .sendTransaction({
        from: accounts[0],
        to: tokenaddress,
        data: tx.data,
        gasPrice: 50000000000,
      })
      .then(async function (receipt: any) {
        const nftcontract = await new web3.eth.Contract(clientABI as [], nftaddress);
        console.log(id, freelanceradd, "sdfsdfsdf");
        let tx1: any = {
          from: accounts[0],
          to: nftaddress,
          data: nftcontract.methods.assignProject(id, freelanceradd).encodeABI(),
        };

        await web3.eth
          .sendTransaction({
            from: accounts[0],
            to: nftaddress,
            data: tx1.data,
            gasPrice: 50000000000,
          })
          .then(function (receipt: any) {
            setapprovEn(true);
            setitemid(id);
            router.push("/client/dashboard");
          });
      });
  };
  const rejectBuy = async (id: any, freelanceradd: any) => {
    const accounts = await web3.eth.getAccounts();
    const nftcontract = await new web3.eth.Contract(clientABI as [], nftaddress);
    let tx: any = {
      from: accounts[0],
      to: nftaddress,
      data: nftcontract.methods.rejectProject(id, freelanceradd).encodeABI(),
    };

    await web3.eth
      .sendTransaction({
        from: accounts[0],
        to: nftaddress,
        data: tx.data,
        gasPrice: 50000000000,
      })
      .then(function (receipt: any) {
        router.push("/client/dashboard");
      });
  };
  const completeBuy = async (id: any, freelanceradd: any) => {
    const accounts = await web3.eth.getAccounts();
    const nftcontract = await new web3.eth.Contract(clientABI as [], nftaddress);
    let tx: any = {
      from: accounts[0],
      to: nftaddress,
      data: nftcontract.methods.completeProject(id).encodeABI(),
    };

    await web3.eth
      .sendTransaction({
        from: accounts[0],
        to: nftaddress,
        data: tx.data,
        gasPrice: 50000000000,
      })
      .then(function (receipt: any) {
        setapprovEn(true);
        router.push("/client/dashboard");
      });
  };
  const getCompletedProjects = async () => {
    const accounts = await web3.eth.getAccounts();
    const projects = await axios.post("https://api.thegraph.com/subgraphs/name/darahask/nftfree", {
      query: `{
        projects(where: {client: "${accounts[0]}"}) {
          project_cost
          id
          freelance
        }
      }`,
    });
    let totalprojects = projects.data.data.projects;
    let arr: any = [];
    for (let i = 0; i < totalprojects.length; i++) {
      arr.push(totalprojects[i].id);
    }
    console.log(arr, "arrrrrrrrrrrdd");
    setprojectsCmpl(arr);
  };
  useEffect(() => {
    getProjects();
    getNameAddress();
    getCompletedProjects();
  }, [approvEn]);
  return (
    <>
      <div className="justify-center flex h-full w-full">
        <div className=" bg-[#171717] w-[90%] justify-center flex-col pt-10">
          <div className={ClientDashboardStyles.allhead + " flex gap-4 justify-start"}>
            <div className={" text-white "}>
              <img width={"150px"} height="150px" src="/augmnt.png"></img>
            </div>
            <div className={ClientDashboardStyles.mainhead + " text-white "}>AUGMNT</div>

            <div className={ClientDashboardStyles.mainheads + " text-white l-10"}>Dashboard</div>

            <div className={"ml-auto"}>
              {avatars !== "" ? <img src={avatars}></img> : <img width={"100px"} height="100px" src="/avatarimage.png"></img>}
            </div>
            <div className={ClientDashboardStyles.mainname + " text-white text-md ml-auto"}>{username}</div>
          </div>
          <div className=" flex ">
            <div className=" min-w-[350px] h-full pl-2 pt-0 ">
              <div className={" bg-[#171717] pt-0 w-[50%]"}>
                <div className={" p-2 flex flex-col h-[100vh] gap-8"}>
                  <div className={ClientDashboardStyles.sidemenu + " p-2 "}>
                    <p className="text-white mt-2.5 pl-2">
                      <button onClick={() => handleclick("projects")}>PROJECTS</button>
                    </p>
                  </div>
                  <div className={ClientDashboardStyles.sidemenu + " p-2 "}>
                    <p className="text-white mt-2.5 pl-2">
                      <button onClick={() => handleclick("createproject")}>CREATE PROJECT</button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-[95%] overflow-hidden gap-4 flex-col bg-[#2E2E2E] p-10">
              <div className={ClientDashboardStyles.sidehead + " p-8 uppercase"}>Available Projects</div>
              <div className={ClientDashboardStyles.projectlist}>
                <div className={" md:w-[95%] flex flex-col overflow-hidden gap-4 text-white p-4 b-1"}>
                  <div className={ClientDashboardStyles.nftlist + " flex gap-4 justify-between"}>
                    <span>PROJECT NAME</span>
                    <span>PROJECT BUDGET</span>
                    <span>PROJECT STATUS</span>
                    <span>ACTIONS</span>
                  </div>
                  {projectdetails &&
                    projectdetails.length &&
                    projectdetails[0].projectName !== "" &&
                    projectdetails?.map((item, index) => (
                      <div key={index} className={ClientDashboardStyles.nftlist + " flex gap-4 justify-between"}>
                        <div>{item.projectName}</div>
                        <div>{item.project_cost}</div>
                        <div>{item.sold ? "On going" : "Created"}</div>
                        <div>
                          <button
                            className={ClientDashboardStyles.bidbtns}
                            key={item.id}
                            onClick={() => {
                              setenableChat(true);
                            }}
                            disabled={item.sold ? false : true}
                          >
                            Chat
                          </button>
                          {!projectsCmpl!.includes(item.id) && (
                            <div className=" flex justify-end w-full ">
                              <button
                                className={ClientDashboardStyles.bidbtnn + " disabled:bg-grey-400"}
                                key={item.id}
                                onClick={() => {
                                  console.log("qqqqqqqq", item.freelancer, item.sold);
                                  approveBuy(item.id, item.freelancer, item.project_cost);
                                }}
                                disabled={item.sold ? false : true}
                              >
                                Approve
                              </button>
                              <button
                                className={ClientDashboardStyles.bidbtn}
                                key={item.id}
                                onClick={() => {
                                  console.log("qqqqqqqq", item.freelancer, item.sold);
                                  rejectBuy(item.id, item.freelancer);
                                }}
                                disabled={item.sold ? false : true}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {projectsCmpl!.includes(item.id) && (
                            <button
                              className={ClientDashboardStyles.bidbtn}
                              key={item.id}
                              onClick={() => {
                                completeBuy(item.id, item.freelancer);
                              }}
                            >
                              Complete
                            </button>
                          )}
                          {enableChat && (
                            <Chat
                              account={useraccount.toString()} //user address
                              supportAddress={item.freelancer} //support address
                              apiKey="WaPzABQ56k.aGFbWHdl5RVMbkwqoenzgfALVwWTQVotWFhkFO6qwpaX5PCQm7sM8NQaC0pgpLNX"
                              env="staging"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
