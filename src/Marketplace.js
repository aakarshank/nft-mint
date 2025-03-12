import { ethers } from "ethers";
import { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router";
import { contractABI } from "./Home";
import { contractAddress } from "./Home";
export default function Marketplace(){
    const[nftMarketplace,setNftMarketplace] = useState([]);
    const [popup,showPopup ] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState([]);
    const navigate = useNavigate();
    const address = useRef("")

    async function purchaseNFT(tokenID){
        try {

            const contract = await getContract();

            if (!selectedNFT.price) {
                console.error("Error: NFT price is missing.");
                return;
            }

            console.log("token id");


            const buyNFT = await contract.buyNFT(tokenID,{value: ethers.utils.parseEther((selectedNFT.price).toString()),gasLimit: 300000 })

            await buyNFT.wait();
            
            console.log("NFT successfully purchased!");
            setSelectedNFT([]);
            showPopup(false);


            return;



        } catch (error) {
            console.log('error',error);
            return null;
        }
    }
    
    async function getContract(){
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            let accounts = await provider.send("eth_requestAccounts", []);
            let account = accounts[0];

            address.current = account;
            return new ethers.Contract(contractAddress, contractABI, signer);
    
        } catch (error) {
            console.error("Error initializing contract:", error);
            return null;
        }
    }

    async function listNFTs(){
        const contract = await getContract();

        const nfts = await contract.returnAllNFTs();

        const onlyNonUserNFTs = nfts.filter((nft)=>(nft.owner.toLowerCase() != address.current.toLowerCase() &&nft.bought == false));
        setNftMarketplace(onlyNonUserNFTs);
    }
    
    useEffect(()=>{
        listNFTs();
    },[]);
    return (
        <div>
            <h1>
                Marketplace!
            </h1>
            {
            nftMarketplace.length > 0 ? (nftMarketplace.map((nft)=>(
                <div>
                    <h1>{nft.name}</h1>
                    {nft.imageURI && <img src={nft.imageURI} alt={nft.name} style={{ width: "300px" }} />}
                    <button onClick={()=>{
                        setSelectedNFT(nft);
                        showPopup(true);

                    }}>Purchase NFT</button>
                </div>
            ))):(
                <h1>no nft currently in the marketplace</h1>
            )
            }

            <button onClick={()=>{navigate("/create-nft")}}>Create an NFT</button><br />
            <button onClick={()=>{navigate("/")}}>Navigate back to Home</button><br />
            <button onClick={()=>{navigate("/your-nfts")}}>View your NFTs</button>
            {popup && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    zIndex: 1000
                }}>
                    <h1>Buy:  <br /> {selectedNFT.name}</h1>
                    <img src={selectedNFT.imageURI} alt={selectedNFT.name} style={{ width: "300px" }} />
                    <h1>Price: {(selectedNFT.price).toString()} ETH</h1>
                    <button onClick={()=>{purchaseNFT(selectedNFT.tokenID);}}>Purchase</button>
                    <button onClick={()=>{showPopup(false);}}>Close</button>
                </div>
            )}

            {popup && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 999
                }} onClick={()=>{showPopup(false);}}></div>
            )}

        </div>

    )
}