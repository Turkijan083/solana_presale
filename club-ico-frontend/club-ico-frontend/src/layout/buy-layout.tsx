import { Icon, IconType } from "@/components/icons";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import usePresale from "@/hooks/usePresale";
import {
  BUYER_HARDCAP,
  BUYER_SOFTCAP,
  BUYER_TOKEN_HARDCAP,
  price_data,
  TOKEN_DECIMAL,
} from "@/constants/constants";

import {
  TOKEN_PRICE1,
  TOKEN_PRICE2,
  TOKEN_PRICE3,
  TOKEN_PRICE4,
  TOKEN_PRICE5,
} from "@/constants/constants";

import axios from 'axios';

interface PriceResponse {
  solana: {
    usd: number;
  };
}


export default function BuyLayout() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      const response = await axios.get<PriceResponse>(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      setPrice(response.data.solana.usd);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Fetch price every 60 seconds
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const { buyToken, transactionPending, startTime, endTime, buyAmount } =
    usePresale();
  const [canBuy, setCanBuy] = useState(true);

  const [solBalance, setSolBalance] = useState(0);
  const [remainBuyAmount, setRemainBuyAmount] = useState(BUYER_TOKEN_HARDCAP);

  useEffect(() => {
    const current = Date.now();
    if (startTime * 1000 < current && endTime * 1000 > current) {
      setCanBuy(true);
    } else {
      setCanBuy(false);
    }
  }, [startTime, endTime]);

  // useEffect(() => {
  //   setRemainBuyAmount(BUYER_TOKEN_HARDCAP - buyAmount / 10 ** TOKEN_DECIMAL);
  // }, [buyAmount]);

  const onBuyToken = async () => {
    if (solBalance < BUYER_SOFTCAP || solBalance > BUYER_HARDCAP) {
      toast.warning("Please check SOL balance again.");
      return;
    }
    buyToken(solBalance, Math.round((solBalance * (price?.valueOf()?? 0) / price_data.PRICE_PER_TOKEN) * 1000) / 1000);
  };

  return (
    <div className="w-full max-w-[700px] rounded-3xl  px-8 sm:px-12 flex flex-col gap-3">
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <div className="h-32 rounded-[20px] bg-[#e6f1fa] flex flex-col justify-between px-5 py-5 shadow-[0_0_50px_0_#00000010]">
          <div className="font-inter text-sm text-[#000000] flex flex-row items-center justify-between">
            <span className="font-bold">From</span>
          </div>
          <div>
            <button className="font-inter font-bold bg-[#d00711] text-[#ffffff] text-[9px] px-2 py-1 rounded-full">
              MAX
            </button>
          </div>
          <div className="flex flex-row items-center justify-between">
            <input
              type="number"
              value={solBalance}
              onChange={(e) => {
                setSolBalance(Number(e.target.value));
              }}
              className="w-full h-10 outline-none px-2 font-inter font-bold text-[#000000] text-xl bg-transparent"
            />
            <div className="w-36 h-10 px-2 py-1 flex flex-row items-center justify-between rounded-full bg-[#c1cfd7]">
              <img alt="sol" src="/images/sol.png" className="h-full" />
              <span className="font-inter font-bold text-[#000000] text-sm">
                SOL
              </span>
            </div>
          </div>
        </div>
        <Icon
          type={IconType.RIGHT}
          className="w-10 h-10 fill-[#00000080] min-w-10 rotate-90 sm:rotate-0"
        />
        <div className="h-32 rounded-[20px] bg-[#e6f1fa] flex flex-col justify-between px-5 py-5 shadow-[0_0_50px_0_#00000010]">
          <div className="font-inter text-sm text-[#000000] flex flex-row items-center justify-between">
            <span className="font-bold">To</span>
            <span className = "px-2 py-1 text-xl flex justify-center font-bold text-gradient-title">
              1 MIRON = {(price_data.PRICE_PER_TOKEN*100).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
              })}{"¢"}
            </span>
          </div>
          <div className="flex flex-row items-center justify-between">
            <input
              value={solBalance * ((price?.valueOf()?? 0)  / price_data.PRICE_PER_TOKEN)}
              className="w-full h-10 outline-none px-2 font-inter font-bold text-[#000000] text-xl bg-transparent"
            />
            <div className="w-40 h-10 px-2 py-1 flex flex-row items-center justify-between rounded-full bg-[#c1cfd7]">
              <img alt="sol" src="/images/club.png" className="h-full" />
              <span className="font-inter font-bold text-[#000000] text-sm">
                MIRON
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className = "flex flex-row items-center">
        <div className="flex flex-col items-center font-inter font-normal text-[#000000] text-xs sm:text-sm">
          <span className="text-center">
            Miron remaining for your wallet limit:{" "}
            {remainBuyAmount.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 4,
            })}{" "}
            (
            {(remainBuyAmount * price_data.PRICE_PER_TOKEN).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 4,
            })}{" "}
            SOL)
          </span>
          <span className="text-center">
            Minimum Per Transaction is {BUYER_SOFTCAP} SOL, Maximum For Presale is{" "}
            {BUYER_HARDCAP} SOL
          </span>
        </div>
        <div className="flex flex-row justify-center">
          {/* {canBuy && !transactionPending && ( */}
            <button
              className={`px-5 py-2 bg-[#d00711] rounded-full text-[#eff3f6] font-inter text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 px-5 py-2.5 text-center me-2 mb-2`}
              onClick={onBuyToken}
            >
              BUY
            </button>
          {/* )} */}
          {transactionPending && (
            <Icon type={IconType.LOADING} className="w-14 h-14" />
          )}
        </div>
      </div>
    </div>
  );
}
