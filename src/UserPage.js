import { ethers } from "ethers"
import { useState,useEffect,useRef } from "react"
import { contractABI,contractAddress } from "./Home"
import { useNavigate } from "react-router";
export default function UserPage(){
    const [userNFTs,setUserNFTs] = useState([]);
    const address = useRef("");
    const navigate = useNavigate();
    
    async function getContract(){
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            let accounts = await provider.send("eth_requestAccounts", []);
            let account = accounts[0];
            const signer = await provider.getSigner();
            address.current = account;

            return new ethers.Contract(contractAddress, contractABI, signer);
        } catch (error) {
            console.error("Error initializing contract:", error);
            return null;
        }
    }




    async function retrieveUserPage(){
        const contract = await getContract();
        const retrievedNFTs = await contract.returnAllNFTs();
        const userNFTs = retrievedNFTs.filter(
            (nft) => nft.owner.toLowerCase() === address.current.toLowerCase()
        );
        setUserNFTs(userNFTs);
    }

    useEffect(()=>{
        retrieveUserPage();


    },[])

    return (
        <div>
            <h1> Your NFTS!
            </h1>
            {userNFTs.map((nft)=>(
                <div>
                    <h1>{nft.name}</h1>
                    {nft.imageURI && <img src={nft.imageURI} alt={nft.name} style={{ width: "300px" }} />}
                    <h1>Price: {(nft.price).toString()} ETH</h1>

                </div>
            ))}
            <button onClick={()=>{navigate("/create-nft")}}>Create an NFT</button><br />
            <button onClick={()=>{navigate("/")}}>Navigate back to Home</button><br />
            <button onClick={()=>{navigate("/marketplace")}}>View all NFTs</button>
        </div>
    )
}