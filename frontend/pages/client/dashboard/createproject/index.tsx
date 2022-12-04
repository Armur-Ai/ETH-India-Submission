import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, Theme, useTheme } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import CreateProjectStyles from "./createproject.module.scss";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import Web3 from "web3";
import clientABI from "../../../../src/abi/client-abi.json";
import { NFTStorage, File } from "nft.storage";

export default function CreateProject() {
  const router = useRouter();
  const emailRef = useRef(null);
  const emailSpanRef = useRef(null);
  const budgetRef = useRef(null);
  const companyRef = useRef(null);
  const phoneRef = useRef(null);
  const [username, setUserName] = useState<string>("");
  const [imageBob, setimageBob] = useState<any>();
  const [avatars, setAvatar] = useState<string>("");
  const [emailErr, setEmailErr] = useState<boolean>(false);
  const [companyErr, setcompanyErr] = useState<boolean>(false);
  const [descriptionErr, setdescriptionErr] = useState<boolean>(false);
  const [contactErr, setcontactErr] = useState<boolean>(false);
  const [budgetErr, setbudgetErr] = useState<boolean>(false);
  const [fields, setFields] = useState({
    company: "",
    budget: "",
    contact: "",
    email: "",
    description: "",
  });
  const web3 = new Web3(
    Web3.givenProvider || "https://quaint-evocative-morning.matic-testnet.discover.quiknode.pro/51f4850ccaec8ad41a57f0dcd7d0e51b694fd6bf/"
  );
  const nftaddress = "0x30ede7289d52412c22b78741e78BB153A4EF6b07";
  const assignClasses = (emailval: string) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailval)) {
      setEmailErr(false);
    } else {
      setEmailErr(true);
    }
  };
  const assignClassesContact = (contactRef: string) => {
    if (/^[0-9]{10}$/.test(contactRef)) {
      setcontactErr(false);
    } else {
      setcontactErr(true);
    }
  };
  const assignClassesbudget = (budgetRef: string) => {
    if (/^[0-9]+$/.test(budgetRef)) {
      setbudgetErr(false);
    } else {
      setbudgetErr(true);
    }
  };

  const handleclick = (type: string) => {
    if (type === "createproject") {
      router.push("/client/dashboard/createproject");
    } else if (type === "projects") {
      router.push("/client/dashboard");
    }
  };
  const handleInputChange = (event: any, inputType: string) => {
    let updatedFields: any = {};
    updatedFields["company"] = inputType === "company" ? event.target.value : fields.company;
    updatedFields["budget"] = inputType === "budget" ? event.target.value : fields.budget;
    updatedFields["contact"] = inputType === "contact" ? event.target.value : fields.contact;
    updatedFields["email"] = inputType === "email" ? event.target.value : fields.email;
    updatedFields["description"] = inputType === "description" ? event.target.value : fields.description;
    setFields(updatedFields);
  };
  const mint = async () => {
    console.log(fields);
    if (fields.company === "") setcompanyErr(true);
    if (fields.budget === "") setbudgetErr(true);
    if (fields.contact === "") setcontactErr(true);
    if (fields.email === "") setEmailErr(true);
    if (fields.description === "") setdescriptionErr(true);
    if (fields.contact !== "") {
      assignClassesContact(fields.contact);
    }
    if (fields.email !== "") {
      assignClasses(fields.email);
    }
    if (fields.company !== "") {
      setcompanyErr(false);
    }
    if (fields.description !== "") {
      setdescriptionErr(false);
    }
    if (fields.budget !== "") {
      assignClassesbudget(fields.budget);
    }
    if (!emailErr && !contactErr && !companyErr && !budgetErr && !descriptionErr) {
      const nftcontract = await new web3.eth.Contract(clientABI as [], nftaddress);
      const client: any = new NFTStorage({
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDEyMDVFNjdBRjM2QzE3NmE2NGQ1OTJlNGZENjc1YWMzQzUyRTU1MGQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3MDA2MDgxODU4OSwibmFtZSI6IkVUSEluZGlhIn0.p6YFrmhMH3t4EV4FSOEbFMJw8njrSJsGCwa9aCvf3KQ",
      });

      web3.eth.getAccounts().then(async (address: any) => {
        toDataURL("https://gateway.pinata.cloud/ipfs/Qmai2aEGZbzTU7vMApdmYVN1TacdEm2S5ys6HZbHWsB1EB").then(async (dataUrl) => {
          console.log("Here is Base64 Url", dataUrl);
          var fileData = dataURLtoFile(dataUrl, "imageName.jpg");
          console.log("Here is JavaScript File Object", fileData);

          const metadata = await client.store({
            name: fields.company + address[0],
            image: fileData,
            projectName: fields.company,
            description: fields.description,
          });
          console.log(metadata.url, "accounttttttttttt");
          let tx: any = {
            from: address[0],
            to: nftaddress,
            data: nftcontract.methods.createListing(metadata.url, Number(fields.budget) * 0.01, fields.budget, Date.now()).encodeABI(),
          };

          await web3.eth
            .sendTransaction({
              from: address[0],
              to: nftaddress,
              data: tx.data,
              gasPrice: 50000000000,
            })
            .then(function (receipt: any) {
              router.push("/client/dashboard");
            });
        });
      });
    }
  };
  const toDataURL = (url: any) =>
    fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  function dataURLtoFile(dataurl: any, filename: any) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

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
  useEffect(() => {
    getNameAddress();
  }, [fields]);
  return (
    <>
      <div className="justify-center flex h-full w-full">
        <div className=" bg-[#171717] w-[90%] justify-center flex-col pt-10">
          <div className="flex gap-4 pl-8 pb-10 pr-10">
            <div className={" text-white "}>
              <img width={"150px"} height="150px" src="/augmnt.png"></img>
            </div>
            <div className={CreateProjectStyles.mainhead + " text-white "}>AUGMNT</div>
            <div className={CreateProjectStyles.mainheads + " text-white "}>Dashboard</div>
            <div className={"ml-auto"}>
              {avatars !== "" ? <img src={avatars}></img> : <img width={"100px"} height="100px" src="/avatarimage.png"></img>}
            </div>
            <div className={CreateProjectStyles.mainname + " text-white text-md ml-auto"}>{username}</div>
          </div>
          <div className=" flex ">
            <div className=" min-w-[350px] h-full pl-2 pt-0 ">
              <div className={" bg-[#171717] pt-0 w-[50%]"}>
                <div className={" p-2 flex flex-col h-[100vh] gap-8"}>
                  <div className={CreateProjectStyles.sidemenu + " p-2 "}>
                    <p className="text-white mt-2.5 pl-2">
                      <button onClick={() => handleclick("projects")}>PROJECTS</button>
                    </p>
                  </div>
                  <div className={CreateProjectStyles.sidemenu + " p-2 "}>
                    <p className="text-white mt-2.5 pl-2">
                      <button onClick={() => handleclick("createproject")}>CREATE PROJECT</button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-[95%] overflow-hidden gap-4 flex-col bg-[#2E2E2E]">
              <div className={CreateProjectStyles.limiter + " h-full p-4"}>
                <div className={CreateProjectStyles.wraplogin100 + "  w-full"}>
                  <span className={CreateProjectStyles.login100formtitle + " p-b-41"}>Create Project</span>
                  <div className={CreateProjectStyles.login100form + " p-b-33 p-t-5"}>
                    <div className={" flex flex-col gap-2 p-6 justify-center"}>
                      <div className="text-center justify-center p-1">
                        <input
                          defaultValue={fields.company}
                          className={CreateProjectStyles.input100 + " placeholder-white placeholder-opacity-50"}
                          placeholder="Project name"
                          onChange={(e) => handleInputChange(e, "company")}
                          required
                        />
                        {companyErr && <span className="text-red-600 text-md">Please add project name</span>}
                      </div>
                      <div className="text-center justify-center p-1">
                        <textarea
                          defaultValue={fields.description}
                          className={CreateProjectStyles.textArea100 + " placeholder-white placeholder-opacity-50"}
                          placeholder="Project description"
                          onChange={(e) => handleInputChange(e, "description")}
                          required
                        />
                        {descriptionErr && <span className="text-red-600 text-md">Please add project description</span>}
                      </div>
                      <div className="text-center justify-center p-1">
                        <input
                          defaultValue={fields.budget}
                          className={CreateProjectStyles.input100 + " placeholder-white placeholder-opacity-50"}
                          placeholder="Budget"
                          onChange={(e) => handleInputChange(e, "budget")}
                          requi-600
                        />
                        {budgetErr && <span className="text-red-600 text-md">Please add budget</span>}
                      </div>
                      <div className="text-center justify-center p-1">
                        <input
                          defaultValue={fields.contact}
                          className={CreateProjectStyles.input100 + " placeholder-white placeholder-opacity-50"}
                          placeholder="Contact Number"
                          onChange={(e) => handleInputChange(e, "contact")}
                          required
                        />
                        {contactErr && <span className="text-red-600 text-md">Please add valid contact number</span>}
                      </div>
                      <div className="text-center justify-center p-1">
                        <input
                          defaultValue={fields.email}
                          className={CreateProjectStyles.input100 + " placeholder-white placeholder-opacity-50"}
                          placeholder="Email"
                          onChange={(e) => handleInputChange(e, "email")}
                          required
                        />
                        {emailErr && <span className="text-red-600 text-md">Please add valid Email Id</span>}
                      </div>
                    </div>
                    <div className={CreateProjectStyles.containerlogin100formbtn + " p-4"}>
                      <button className={CreateProjectStyles.login100formbtn} onClick={() => mint()}>
                        Mint
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
