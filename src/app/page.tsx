import { Button, Flex } from "antd";
import Link from "next/link";
import './index.css'
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start">
      <p className="marginTop20">Wallet Demo</p>
      <Flex gap="large" vertical className="marginTop20">
        <Button >
          <Link href="/01-wallet-connect">wallet-connect</Link>
        </Button>
        <Button>
          <Link href="/02-reading-chains-and-blocks">
            reading-chains-and-blocks
          </Link>
        </Button>
        <Button>
          <Link href="/03-batch-create-accounts">
            batch-create-accounts
          </Link>
        </Button>
        <Button>
          <Link href="/04-fortune-draw">fortune-draw</Link>
        </Button>
      </Flex>
    </div>
  );
}
