import React , { useState , useEffect } from "react";
import {
  BUYER_HARDCAP,
  BUYER_SOFTCAP,
  price_data,
  TOKEN_PRICE1,
  TOKEN_DECIMAL,
  TOKEN_PRESALE_HARDCAP,
} from "@/constants/constants";
import usePresale from "@/hooks/usePresale";
import axios from 'axios';

const buyerTokenHardcap = BUYER_HARDCAP / price_data.PRICE_PER_TOKEN;

interface PriceResponse {
  solana: {
    usd: number;
  };
}

export default function StatsLayout() {
  const { buyAmount, totalBuyAmount } = usePresale();

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

  console.log("stress");
  console.log((totalBuyAmount/(10 ** TOKEN_DECIMAL)).toString());
  console.log(TOKEN_PRESALE_HARDCAP);
  console.log(Math.floor(
    (((totalBuyAmount / (10 ** TOKEN_DECIMAL))) * 100) /
      TOKEN_PRESALE_HARDCAP));

  return (
    <div className="flex flex-col items-center gap-2">
      {/* <span className="text-center font-bold font-inter text-base sm:text-lg text-[#000000]">
        With A Presale Price Of{" "}
        {PRICE_PER_TOKEN.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 9,
        })}{" "}
        SOL. Our Minimum Limit Will Be {BUYER_SOFTCAP} SOL And A Max Of{" "}
        {BUYER_HARDCAP} SOL. See Our Whitepaper For Further Details.
      </span> */}
      <div className="flex flex-col items-center justify-between w-full gap-5 sm:flex-row sm:gap-12">
        <div />
        <ProcessBar
          label="Presale Amount Received"
          value={Math.floor(
            ((totalBuyAmount / 10 ** TOKEN_DECIMAL) * 100) /
              TOKEN_PRESALE_HARDCAP
          )}
        />
        {/* <ProcessBar
          label="Your Hard Cap Amount"
          value={Math.floor(
            ((buyAmount / 10 ** TOKEN_DECIMAL) * 100) / buyerTokenHardcap
          )}
        /> */}
        <div />
      </div>
      <div className="flex flex-col items-center justify-between w-full gap-5 sm:flex-row font-inter">
        <div />
        <div className="flex flex-col items-center sm:items-start">
          <span className="font-normal text-sm text-[#000000]">
            Presale Amount Received:
          </span>
          <span className="font-normal text-base text-[#000000]">
            {(totalBuyAmount / 10 ** TOKEN_DECIMAL).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            MIRON
          </span>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <span className="font-normal text-sm text-[#000000]">
            Maximum Presale Amount Allocated:
          </span>
          <span className="font-normal text-base text-[#000000]">
            {TOKEN_PRESALE_HARDCAP.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            MIRON
          </span>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <span className="font-normal text-sm text-[#000000]">
            MIRON Price:
          </span>
          <span className="font-normal text-base text-[#000000]">
            1 MIRON = {(price_data.PRICE_PER_TOKEN*100).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
              })}{"¢"}
          </span>
        </div>
        <div />
      </div>
    </div>
  );
}

interface ProcessBarProps {
  label: string;
  value: number;
}

const ProcessBar: React.FC<ProcessBarProps> = ({ label, value }) => {
  return (
    <div className="relative flex flex-col items-center w-full font-inter">
      <div className="w-full flex flex-row items-end justify-between font-bold text-base text-[#000000]">
        <div />
        <div className="flex flex-col items-center w-1">
          <span>25%</span>
          <div className="w-1 h-4 bg-[#000000]" />
        </div>
        <div className="flex flex-col items-center w-1">
          <span>50%</span>
          <div className="w-1 h-4 bg-[#000000]" />
        </div>
        <div className="flex flex-col items-center w-1">
          <span>75%</span>
          <div className="w-1 h-4 bg-[#000000]" />
        </div>
        <div />
      </div>
      <div className="w-full h-5 sm:h-7 rounded-full bg-[#cccccc] overflow-hidden">
        <div
          className="h-full bg-[#d00711]"
          style={{
            width: `${value}%`,
          }}
        ></div>
      </div>
      <div
        className="absolute w-0.5 h-0.5 flex flex-row items-start justify-center top-8 "
        style={{
          left: `${value}%`,
        }}
      >
        <div className="min-w-11 min-h-11 rounded-full bg-[#d00711] flex flex-row items-center justify-center text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium text-smtext-center">
          <span className="font-bold text-base text-[#ffffff]">{value}%</span>
        </div>
      </div>
      <span className="mt-4 font-bold text-base sm:text-xl text-[#000000] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};
