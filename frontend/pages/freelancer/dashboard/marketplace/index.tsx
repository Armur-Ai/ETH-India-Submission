import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, Theme, useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FreelancerMarketlaceStyles from "./marketplace.module.scss";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import axios from "axios";
import Web3 from "web3";
import clientABI from "../../../../src/abi/client-abi.json";
import tokenABI from "../../../../src/abi/token-abi.json";
export default function FreelancerMarketplace() {
  const router = useRouter();
  const [username, setUserName] = useState<string>("");
  const [avatars, setAvatar] = useState<string>("");
  const [Nft, setNft] = useState([
    {
      projectName: "",
      project_cost: 0,
      description: "",
      freelancer: "",
      id: "",
      sold: false,
      listing_price: "",
    },
  ]);
  const web3 = new Web3(
    Web3.givenProvider || "https://quaint-evocative-morning.matic-testnet.discover.quiknode.pro/51f4850ccaec8ad41a57f0dcd7d0e51b694fd6bf/"
  );
  const nftaddress = "0x30ede7289d52412c22b78741e78BB153A4EF6b07";
  const tokenaddress = "0x54fc29154Dc49D36d58A18A8fD035182EB3BB3a1";
  function getStyles(name: string, personName: string[], theme: Theme) {
    return {
      fontWeight: personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
    };
  }
  const theme = useTheme();
  const [personName, setPersonName] = useState<string[]>([]);
  const handleclick = (type: string) => {
    if (type === "marketplace") {
      router.push("/freelancer/dashboard");
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
  const getAllNft = async () => {
    const projects = await axios.post("https://api.thegraph.com/subgraphs/name/darahask/nftfree", {
      query: `{
        listings(where: {sold: false}) {
          project_cost
          listing_price
          id
          client
        }
      }`,
    });
    const NftDetails = projects.data.data.listings;
    console.log(NftDetails, "list");
    const nftcontract = await new web3.eth.Contract(clientABI as [], nftaddress);
    for (let i = 0; i < NftDetails.length; i++) {
      let data = await nftcontract.methods.tokenURI(NftDetails[i].id).call();
      console.log(data, "data");
      if (data !== "" && data.includes("ipfs")) {
        const dats = data.split(":/").join("");
        console.log(dats, i, "data");
        const nftData = `https://nftstorage.link/${dats}`;
        const response = await fetch(nftData);
        const json = await response.json();
        NftDetails[i].projectName = json.projectName;
        NftDetails[i].description = json.description;
      } else {
        NftDetails[i].projectName = "New project";
        NftDetails[i].description = "Project on NFT";
      }
    }
    console.log(NftDetails);
    setNft(NftDetails);
  };
  const buyToken = async (id: any, price: any) => {
    const accounts = await web3.eth.getAccounts();
    const tokencontract = await new web3.eth.Contract(tokenABI as [], tokenaddress);
    let tx: any = {
      from: accounts[0],
      to: tokenaddress,
      data: tokencontract.methods.approve(nftaddress, price).encodeABI(),
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
        let tx1: any = {
          from: accounts[0],
          to: nftaddress,
          data: nftcontract.methods.purchaseListing(id).encodeABI(),
        };

        await web3.eth
          .sendTransaction({
            from: accounts[0],
            to: nftaddress,
            data: tx1.data,
            gasPrice: 50000000000,
          })
          .then(function (receipt: any) {
            router.push("/freelancer/dashboard");
          });
      });
  };
  useEffect(() => {
    getNameAddress();
    getAllNft();
  }, []);
  return (
    <>
      <div className="justify-center flex h-full w-full">
        <div className=" bg-[#171717] w-[90%] justify-center flex-col pt-10">
          <div className="flex gap-4 pl-8 pb-10 pr-10">
            <div className={FreelancerMarketlaceStyles.mainhead + " text-white "}>
              <img width={"150px"} height="150px" src="/augmnt.png"></img>
            </div>
            <div className={FreelancerMarketlaceStyles.mainhead + " text-white "}>AUGMNT</div>
            <div className={FreelancerMarketlaceStyles.mainheads + " text-white "}>Dashboard</div>
            <div className={"ml-auto"}>
              {avatars !== "" ? <img src={avatars}></img> : <img width={"100px"} height="100px" src="/avatarimage.png"></img>}
            </div>
            <div className={FreelancerMarketlaceStyles.mainname + " text-white text-md ml-auto"}>{username}</div>
          </div>
          <div className=" flex ">
            <div className=" min-w-[350px] h-full pl-2 pt-0 ">
              <div className={" bg-[#171717] pt-0 w-[50%]"}>
                <div className={" p-2 flex flex-col h-[100vh] gap-8"}>
                  <div className={FreelancerMarketlaceStyles.sidemenu + " p-2 "}>
                    <p className="text-white mt-2.5 pl-2">
                      <button onClick={() => handleclick("projects")}>PROJECTS</button>
                    </p>
                  </div>
                  <div className={FreelancerMarketlaceStyles.sidemenu + " p-2 "}>
                    <p className="text-white mt-2.5 pl-2">
                      <button onClick={() => handleclick("marketplace")}>MARKETPLACE</button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-[95%] overflow-hidden gap-4 flex-col bg-[#2E2E2E]">
              <div className="md:w-[95%] overflow-hidden gap-4">
                <div id="sortDropdownDiv" className="flex items-center sm:justify-center md:justify-between 2xs:p-0 lg:pr-6 p-8">
                  <div className="flex 2xs:flex-col 2xs:gap-4 md:flex-row 2xs:justify-center 2xs:items-center  lg:gap-8 w-full lg:justify-start  ">
                    <div className="z-[3] b-1 bg-[#171717] ">
                      <div className="m-auto p-2 bg-[#171717]  h-[60px] flex">
                        <input
                          type="text"
                          maxLength={40}
                          className={" mt-2.5 pl-2 bg-gray-100 placeholder:text-gray-900"}
                          placeholder="Search"
                          // onKeyDown={onKeyDown}
                        />
                        <div className="pt-5 pl-2 cursor-pointer">
                          <SearchIcon
                            onClick={() => {
                              // handleSearch();
                            }}
                            className="text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="z-[2] b-1 bg-[#171717]">
                      <FormControl sx={{ m: 1, width: 300, height: 1 }}>
                        <InputLabel sx={{ color: "white" }} id="demo-multiple-name-label">
                          Budget
                        </InputLabel>
                        <Select
                          labelId="demo-multiple-name-label"
                          id="demo-multiple-name"
                          multiple
                          value={personName}
                          onChange={handleChange}
                          input={<OutlinedInput label="Name" />}
                        >
                          {/* {nft.map((name) => (
                            <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
                              {name}
                            </MenuItem>
                          ))} */}
                        </Select>
                      </FormControl>
                    </div>
                    <div className="z-[1] b-1 bg-[#171717]">
                      <FormControl sx={{ m: 1, width: 300, height: 1, border: "white" }}>
                        <InputLabel sx={{ color: "white" }} id="demo-multiple-name-label">
                          Date
                        </InputLabel>
                        <Select
                          labelId="demo-multiple-name-label"
                          id="demo-multiple-name"
                          multiple
                          value={personName}
                          onChange={handleChange}
                          input={<OutlinedInput label="Name" />}
                        >
                          {/* {names.map((name) => (
                            <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
                              {name}
                            </MenuItem>
                          ))} */}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
              </div>
              <div className={" md:w-[95%] flex flex-col flex-wrap overflow-hidden gap-4  text-white p-4 b-1"}>
                <div className={FreelancerMarketlaceStyles.sidehead + " p-8 uppercase"}>NFT MARKEPLACE</div>
                <div className={FreelancerMarketlaceStyles.projectlist + " flex flex-wrap overflow-hidden gap-4 bg-[#171717] text-white p-4"}>
                  {Nft.map((item, index) => (
                    <div key={index} className={FreelancerMarketlaceStyles.nftlist + " flex-col border-white b-1 border-solid"}>
                      <div>{item.projectName}</div>
                      <div>{item.project_cost}</div>
                      <div>{item.description}</div>
                      <div>
                        <button
                          onClick={() => {
                            buyToken(item.id, item.listing_price);
                          }}
                          key={item.id}
                          className={FreelancerMarketlaceStyles.bidbtn}
                        >
                          BUY
                        </button>
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
