import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, Theme, useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import nft from "../../../src/json/nft.json";
import clientABI from "../../../src/abi/client-abi.json";
import FreelancerDashboardStyles from "./dashboard.module.scss";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import axios from "axios";
import Web3 from "web3";
import { Chat } from "@pushprotocol/uiweb";

export default function FreelancerDashboard() {
  const router = useRouter();
  const [username, setUserName] = useState<string>("");
  const [avatars, setAvatar] = useState<string>("");
  const [enableChat, setenableChat] = useState<boolean>(false);
  const [useraccount, setUserAccount] = useState<string>("");
  function getStyles(name: string, personName: string[], theme: Theme) {
    return {
      fontWeight: personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
    };
  }
  const web3 = new Web3(
    Web3.givenProvider || "https://quaint-evocative-morning.matic-testnet.discover.quiknode.pro/51f4850ccaec8ad41a57f0dcd7d0e51b694fd6bf/"
  );
  const nftaddress = "0x30ede7289d52412c22b78741e78BB153A4EF6b07";
  const theme = useTheme();
  const [personName, setPersonName] = useState<string[]>([]);
  const [projectdetails, setProjectDetails] = useState([
    {
      projectName: "",
      project_cost: 0,
      description: "",
      client: "",
      id: "",
      sold: false,
    },
  ]);
  const handleclick = (type: string) => {
    if (type === "marketplace") {
      router.push("/freelancer/dashboard/marketplace");
    } else if (type === "projects") {
      router.push("/freelancer/dashboard");
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
  const getProjectsFreelancer = async () => {
    const accounts = await web3.eth.getAccounts();
    setUserAccount(accounts[0]);
    const projects = await axios.post("https://api.thegraph.com/subgraphs/name/darahask/nftfree", {
      query: `{
        listings(where: {freelancer: "${accounts[0]}"}) {
          project_cost
          id
          client
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
    console.log(totalprojects);
    setProjectDetails(totalprojects);
  };
  useEffect(() => {
    getProjectsFreelancer();
    getNameAddress();
  }, []);
  return (
    <>
      <div className="justify-center flex h-full w-full">
        <div className=" bg-[#171717] w-[90%] justify-center flex-col pt-10">
          <div className="flex gap-2">
            <div className={" text-white"}>
              <img width={"150px"} height="150px" src="/augmnt.png"></img>
            </div>
            <div className={FreelancerDashboardStyles.mainhead + " text-white "}>AUGMNT</div>
            <div className={FreelancerDashboardStyles.mainheads + " text-white "}>Dashboard</div>
            <div className={"ml-auto"}>
              {avatars !== "" ? <img src={avatars}></img> : <img width={"100px"} height="100px" src="/avatarimage.png"></img>}
            </div>
            <div className={FreelancerDashboardStyles.mainname + " text-white text-md ml-auto"}>{username}</div>
          </div>
          <div className=" flex ">
            <div className=" min-w-[350px] h-full pl-2 pt-0 ">
              <div className={" bg-[#171717] pt-0 w-[50%]"}>
                <div className={" p-2 flex flex-col h-[100vh] gap-8"}>
                  <div className={FreelancerDashboardStyles.sidemenu + " p-2 "}>
                    <p className="text-white mt-2.5 pl-2">
                      <button onClick={() => handleclick("projects")}>PROJECTS</button>
                    </p>
                  </div>
                  <div className={FreelancerDashboardStyles.sidemenu + " p-2 "}>
                    <p className="text-white mt-2.5 pl-2">
                      <button onClick={() => handleclick("marketplace")}>MARKETPLACE</button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-[95%] overflow-hidden gap-4 flex-col bg-[#2E2E2E] p-10">
              <div className={FreelancerDashboardStyles.sidehead + " p-8 uppercase"}>Available Projects</div>
              <div className={FreelancerDashboardStyles.projectlist}>
                <div className={" md:w-[95%] flex flex-col overflow-hidden gap-4 text-white p-4 b-1"}>
                  <div className={FreelancerDashboardStyles.nftlist + " flex gap-4 justify-between"}>
                    <span>COMPANY NAME</span>
                    <span>PROJECT BUDGET</span>
                    <span>PROJECT STATUS</span>
                  </div>
                  {projectdetails &&
                    projectdetails.length &&
                    projectdetails[0].projectName !== "" &&
                    projectdetails?.map((item, index) => (
                      <div key={index} className={FreelancerDashboardStyles.nftlist + " flex gap-4 justify-between"}>
                        <div>{item.projectName}</div>
                        <div>{item.project_cost}</div>
                        <div>{"on Going"}</div>
                        <button
                          className={FreelancerDashboardStyles.bidbtn}
                          key={item.id}
                          onClick={() => {
                            console.log("qqqqqqqq", item.client, item.sold);
                            setenableChat(true);
                          }}
                        >
                          Chat
                        </button>
                        {enableChat && (
                          <Chat
                            account={useraccount} //user address
                            supportAddress={item.client} //support address
                            apiKey="WaPzABQ56k.aGFbWHdl5RVMbkwqoenzgfALVwWTQVotWFhkFO6qwpaX5PCQm7sM8NQaC0pgpLNX"
                            env="staging"
                          />
                        )}
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
