import React from "react";
import TimerLayout from "@/layout/timer-layout";
import BuyLayout from "@/layout/buy-layout";
import StatsLayout from "@/layout/stats-layout";
import usePresale from "@/hooks/usePresale";
import { toast } from "react-toastify";
import { useWallet } from "@solana/wallet-adapter-react";
import { price_data, TOKEN_PRICE1 , TOKEN_PRICE2 , TOKEN_PRICE3 , TOKEN_PRICE4 , TOKEN_PRICE5 , TOKEN_DECIMAL} from "@/constants/constants";

export default function Home() {

  const { select, wallets, publicKey, disconnect } = useWallet();
  const { buyAmount, totalBuyAmount } = usePresale();

  let stageText = '';
  if ( (totalBuyAmount/(10 ** TOKEN_DECIMAL)) < 15000000) { 
    stageText = 'Presale Stage 1';
  }
  else if ( (totalBuyAmount/(10 ** TOKEN_DECIMAL)) >= 15000000 && (totalBuyAmount/(10 ** TOKEN_DECIMAL)) < 60000000)  {
    stageText = 'Presale Stage 2';
    price_data.PRICE_PER_TOKEN = TOKEN_PRICE2;
  }
  else if ( (totalBuyAmount/(10 ** TOKEN_DECIMAL)) >= 60000000 && (totalBuyAmount/(10 ** TOKEN_DECIMAL)) < 105000000) {
    stageText = 'Presale Stage 3';
    price_data.PRICE_PER_TOKEN = TOKEN_PRICE3;
  }
  else if ( (totalBuyAmount/(10 ** TOKEN_DECIMAL)) >= 105000000 && (totalBuyAmount/(10 ** TOKEN_DECIMAL)) < 150000000) {
    stageText = 'Presale Stage 4';
    price_data.PRICE_PER_TOKEN = TOKEN_PRICE4;
  }
  else if ( (totalBuyAmount/(10 ** TOKEN_DECIMAL)) >= 150000000 && (totalBuyAmount/(10 ** TOKEN_DECIMAL)) < 195000000) {
    stageText = 'Presale Stage 5';
    price_data.PRICE_PER_TOKEN = TOKEN_PRICE5;
  }

  const onWalletConnect = () => {
    if (!publicKey) {
      const installedWallets = wallets.filter(
        (wallet) => wallet.readyState === "Installed"
      );
      if (installedWallets.length <= 0) {
        toast.warning("Phantom wallet is not installed yet.");
        return;
      }
      select(wallets[0].adapter.name);
    } else {
      disconnect();
    }
  };

  const {
    updateAuth,
    createPresale,
    depositToken,
    updatePresale,
    claimToken,
    withdrawSol,
    withdrawToken,
  } = usePresale();

  const onCreatePresale = async () => {
    await createPresale();
  };

  const onDepositToken = async () => {
    await depositToken();
  };

  const onWithdrawToken = async () => {
    await withdrawToken();
  };

  const onUpdateAuth = async () => {
    await updateAuth();
  };
  const onUpdatePresale = async () => {
    await updatePresale();
  };

  const onClaimClub = async () => {
    await claimToken();
  };

  const onWithdrawSol = async () => {
    await withdrawSol();
  };
  return (
    <div className="flex flex-row justify-center">
      <div className="px-5 py-3 relative flex flex-col gap-2 my-5 max-w-[700px] rounded-3xl bg-gradient-to-r from-white to-blue-200 bg-opacity-60 shadow-md shadow-blue-200 filter backdrop-filter bg-blend-overlay">
        <div className="flex flex-row items-center h-24 gap-4 sm:h-32 md:justify-center min-h-[200px]">
          <div className="w-1/3 flex justify-end">
            <button
              className="px-5 py-2 rounded-full font-inter text-sm font-bold text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              onClick={onClaimClub}
            >
              CLAIM MIRON
            </button>
          </div>
          <div className="w-1/3 flex justify-center py-1">
              <div className="flex-col hidden sm:flex">
                <span className="my-1 max-h-[50px] flex justify-center">
                  <img alt="logo" src="/miron.png" className="h-full" />
                </span>
                <span className="items-center justify-center flex max-h-[120px] my-1">
                  <img alt="logo" src="/logo.png" className="h-full" />
                </span>
                <span className="px-2 py-2 text-xl flex justify-center font-bold text-gradient-title">
                  {stageText}
                </span>
              </div>
          </div>

          <div className="w-1/3 justify-center">
            <button
              onClick={onWalletConnect}
              className="px-5 py-2 rounded-full font-inter text-sm font-bold text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              {!publicKey
                ? "CONNECT WALLET"
                : publicKey.toBase58().slice(0, 6) +
                  " ... " +
                  publicKey.toBase58().slice(-6)}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-12 lg:flex-row justify-center">
          <TimerLayout />
        </div>
        <div className="flex flex-col items-center gap-12 lg:flex-row justify-center">
           <BuyLayout />
        </div>
          
      </div>
    </div>
  );
}
