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
        <div className="container">
            <h1>
                Marketplace!
            </h1>
            {
            nftMarketplace.length > 0 ? (nftMarketplace.map((nft)=> (
                <div className="nft-card">
                    <h1>{nft.name}</h1>
                    {nft.imageURI && <img className="nft-image" src={nft.imageURI} alt={nft.name} />}
                    <button className="btn" onClick={()=>{
                        setSelectedNFT(nft);
                        showPopup(true);

                    }}>Purchase NFT</button>
                </div>
            )) ) : (
                <h1>no nft currently in the marketplace</h1>
            )
            }

            <button className="btn" onClick={()=>{navigate("/create-nft")}}>Create an NFT</button><br />
            <button className="btn" onClick={()=>{navigate("/")}}>Navigate back to Home</button><br />
            <button className="btn" onClick={()=>{navigate("/your-nfts")}}>View your NFTs</button>
            {popup && (
                <div className="popup">
                    <h1>Buy:  <br /> {selectedNFT.name}</h1>
                    <img className="nft-image" src={selectedNFT.imageURI} alt={selectedNFT.name} />
                    <h1>Price: {(selectedNFT.price).toString()} ETH</h1>
                    <button className="btn" onClick={()=>{purchaseNFT(selectedNFT.tokenID);}}>Purchase</button>
                    <button className="btn" onClick={()=>{showPopup(false);}}>Close</button>
                </div>
            )}

            {popup && (
                <div className="overlay" onClick={()=>{showPopup(false);}}></div>
            )}

        </div>

    )
}