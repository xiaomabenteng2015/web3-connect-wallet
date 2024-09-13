import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, optimism, immutableZkEvm } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'

// a temp project id for testing
const projectId = '4703d1a7a30b63665f8d8e8339a9aceb'

export const WCConnector = walletConnect({
  projectId,
  metadata: {
    icons: ['https://example.com/icon.png'],
    name: 'Example',
    description: 'Example website',
    url: 'https://example.com',
  },
})

export const config = createConfig({
  chains: [mainnet, optimism, arbitrum, immutableZkEvm],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [immutableZkEvm.id]: http(),
  },
  connectors: [
    WCConnector,
    injected()
  ]
})
