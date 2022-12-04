import FreelancerSignupstyles from "./freelancersignup.module.scss";
import { useRouter } from "next/router";
import React, { useState, useRef, useEffect } from "react";
import Web3 from "web3";
import clientABI from "../../../src/abi/client-abi.json";

export default function FreelancerSignup() {
  const router = useRouter();
  const [emailErr, setEmailErr] = useState<boolean>(false);
  const [companyErr, setcompanyErr] = useState<boolean>(false);
  const [contactErr, setcontactErr] = useState<boolean>(false);
  const [nameErr, setnameErr] = useState<boolean>(false);
  const [fields, setFields] = useState({
    company: "",
    name: "",
    contact: "",
    email: "",
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
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, inputType: string) => {
    let updatedFields: any = {};
    updatedFields["name"] = inputType === "name" ? event.target.value : fields.name;
    updatedFields["company"] = inputType === "company" ? event.target.value : fields.company;
    updatedFields["contact"] = inputType === "contact" ? event.target.value : fields.contact;
    updatedFields["email"] = inputType === "email" ? event.target.value : fields.email;
    setFields(updatedFields);
  };
  const createClient = async () => {
    if (fields.company === "") setcompanyErr(true);
    if (fields.name === "") setnameErr(true);
    if (fields.contact === "") setcontactErr(true);
    if (fields.email === "") setEmailErr(true);
    if (fields.contact !== "") {
      assignClassesContact(fields.contact);
    }
    if (fields.email !== "") {
      assignClasses(fields.email);
    }
    if (fields.company !== "") {
      setcompanyErr(false);
    }
    if (fields.name !== "") {
      setnameErr(false);
    }
    if (!emailErr && !contactErr && !nameErr) {
      const nftcontract = await new web3.eth.Contract(clientABI as [], nftaddress);
      web3.eth.getAccounts().then((address: any) => {
        let tx: any = {
          from: address[0],
          to: nftaddress,
          data: nftcontract.methods.addFreelancer(fields.name, fields.email, fields.contact).encodeABI(),
        };
        console.log(address[0], "accounttttttttttt");
        web3.eth
          .sendTransaction({
            from: address[0],
            to: nftaddress,
            data: tx.data,
            gasPrice: 50000000000,
          })
          .then(function (receipt: any) {
            router.push("/freelancer/dashboard");
          });
      });
    }
  };
  useEffect(() => {}, [fields]);
  return (
    <>
      <div>
        <div className={FreelancerSignupstyles.limiter + " h-full"}>
          <div className={FreelancerSignupstyles.containerlogin100}>
            <div className={FreelancerSignupstyles.wraplogin100 + " p-t-30 p-b-50"}>
              <span className={FreelancerSignupstyles.login100formtitle + " p-b-41 p-6"}>WELCOME TO AUGMNT</span>
              <div className={FreelancerSignupstyles.login100form + " "}>
                <div className={FreelancerSignupstyles.logintext + " flex flex-col justify-center items-center font-header uppercase "}>
                  <span>Contact details</span>
                </div>
                <div className={" flex flex-col gap-1 p-6 justify-center"}>
                  <div className="text-center justify-center p-4">
                    <input
                      defaultValue={fields.name}
                      className={FreelancerSignupstyles.input100}
                      onChange={(e) => handleInputChange(e, "name")}
                      placeholder="Name"
                    />
                    {nameErr && <span className="text-red-600 text-md">Please add name name</span>}
                  </div>

                  <div className="text-center justify-center p-4">
                    <input
                      defaultValue={fields.email}
                      className={FreelancerSignupstyles.input100}
                      onChange={(e) => handleInputChange(e, "email")}
                      placeholder="Email"
                    />
                    {emailErr && <span className="text-red-600 text-md">Please add Email Id</span>}
                  </div>
                  <div className="text-center justify-center p-4">
                    <input
                      defaultValue={fields.contact}
                      className={FreelancerSignupstyles.input100}
                      onChange={(e) => handleInputChange(e, "contact")}
                      placeholder="Contact"
                    />
                    {contactErr && <span className="text-red-600 text-md">Please add contact number</span>}
                  </div>
                </div>

                <div className={FreelancerSignupstyles.containerlogin100formbtn + " p-4"}>
                  <button className={FreelancerSignupstyles.login100formbtn} onClick={() => createClient()}>
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
