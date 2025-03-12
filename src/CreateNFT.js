import { ethers } from "ethers";
import { contractABI } from "./Home";
import { contractAddress } from "./Home";
import { useState } from "react";
export default function CreateNFT(){
    const[name,setName] = useState("");
    const [description,setDescription] = useState("");
    const [price,setPrice] = useState(0);
    const [image, setImage] = useState(null);
    const PINATA_API_KEY = "39bcf4caf5b98c8f48a1";
    const PINATA_SECRET_KEY = "00a467a2d2ab829dae6ff0319650a5077b754f0ece2c498d6b0be9a97087f23a";
    async function getContract(){
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            return new ethers.Contract(contractAddress, contractABI, signer);
        } catch (error) {
            console.error("Error initializing contract:", error);
            return null;
        }
    }

    
    const uploadToIPFS = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                method: "POST",
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Image upload failed");

            const result = await response.json();
            return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

        } catch (error) {
            console.error("Couldn't upload to IPFS:", error);
            alert("IPFS upload failed");
        }

    }
    const uploadMetadataToIPFS = async (imageURI) => {
        try {
            const metadata = {
                name,
                description,
                image: imageURI,
            };

            const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
                body: JSON.stringify(metadata),
            });

            if (!response.ok) throw new Error("Metadata upload failed");

            const result = await response.json();
            return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
        } catch (error) {
            console.error("IPFS metadata upload failed:", error);
            alert("Failed to upload metadata to IPFS");
        }
    };

    const createNFT = async () =>{
        if (name == ""| description=="" || !image || price==0) {
            alert("Please fill in all fields");
            return;
        }
        try {
        const contract = await getContract();

        const imageURI = await uploadToIPFS(image);

        const imageMetadataURI = await uploadMetadataToIPFS(imageURI);

        const createNFTTX = await contract.mintNFT(imageMetadataURI,imageURI,price,name);

        await createNFTTX.wait();

        console.log("Sucessfully minted NFT");
        } catch(error) {
            console.log("error", error);

        }


        
    }
    return (
        <div>
            <h1>
                Create an NFT
            </h1>

            <input type='text' placeholder="enter NFT name here..." onChange={(e)=>{setName(e.target.value)}} /><br />
            <input type="text" placeholder="enter NFT description here..." onChange={(e)=>{setDescription(e.target.value)}} /><br />
            <input type="number" placeholder="enter NFT price here..." onChange={(e)=>{setPrice(parseInt(e.target.value))}} /><br />
            <h4>Upload an Image: </h4>
            <input type="file" id="img" name="img" accept="image/*" onChange={(e)=>{setImage(e.target.files[0])}} /><br /><br />
            <button onClick={createNFT}>Create NFT</button>


        </div>

    )
}