import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { IDL } from "../idl/token_presale";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  BUYER_HARDCAP,
  BUYER_TOKEN_HARDCAP,
  PRESALE_AUTHORITY,
  PRESALE_ID,
  PRESALE_PROGRAM_PUBKEY,
  PRESALE_SEED,
  price_data,
  TOKEN_DECIMAL,
  TOKEN_PRESALE_HARDCAP,
  TOKEN_PUBKEY,
  USER_SEED,
  token_mint_pubkey,
  token_owner_pubkey,
  sol_program_pubkey,
} from "@/constants/constants";
import { toast } from "react-toastify";
import { Connection , SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";

export default function usePresale() {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [transactionPending, setTransactionPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);
  const [totalBuyAmount, setTotalBuyAmount] = useState(0);

  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
      );
      return new anchor.Program(IDL, PRESALE_PROGRAM_PUBKEY, provider);
    }
  }, [connection, anchorWallet]);

  useEffect(() => {
    console.log("usePresale useEffect log - 1 : ", program, transactionPending);

    const getPresaleInfo = async () => {
      if (program && !transactionPending) {
        try {
          setLoading(true);
          const [presale_info, presale_bump] = findProgramAddressSync(
            [
              utf8.encode(PRESALE_SEED),
              PRESALE_AUTHORITY.toBuffer(),
              new Uint8Array([PRESALE_ID]),
            ],
            program.programId
          );
          console.log(presale_info.toBase58());
          // @ts-ignore
          const info = await program.account.presaleInfo.fetch(presale_info);
          setStartTime(info.startTime);
          setEndTime(info.endTime);
          setTotalBuyAmount(info.soldTokenAmount);
          console.log("getPresaleInfo log - 1 : ", info);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };

    const getUserInfo = async () => {
      if (program && publicKey && !transactionPending) {
        try {
          setLoading(true);
          const [userInfo, userBump] = findProgramAddressSync(
            [
              utf8.encode(USER_SEED),
              PRESALE_AUTHORITY.toBuffer(),
              publicKey.toBuffer(),
              new Uint8Array([PRESALE_ID]),
            ],
            program.programId
          );
          // @ts-ignore
          const info = await program.account.userInfo.fetch(userInfo);
          setBuyAmount(info.buyTokenAmount);
          console.log("User Info : ", info);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };

    getPresaleInfo();
    getUserInfo();
  }, [publicKey, program, transactionPending, connection, anchorWallet]);

  const createPresale = async () => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const [presale_info, presale_bump] = findProgramAddressSync(
          [
            utf8.encode(PRESALE_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );

        const bigIntHardcap =
          BigInt(TOKEN_PRESALE_HARDCAP) * BigInt(10 ** TOKEN_DECIMAL);
        const bigIntBuyerHardcap =
          BigInt(BUYER_TOKEN_HARDCAP) * BigInt(10 ** TOKEN_DECIMAL);
        const tokenPrice = price_data.PRICE_PER_TOKEN * 10 ** TOKEN_DECIMAL;

        const tx = await program.methods
          .createPresale(
            TOKEN_PUBKEY,
            new PublicKey("So11111111111111111111111111111111111111112"),
            new anchor.BN(10 ** TOKEN_DECIMAL), // softcap
            new anchor.BN(bigIntHardcap.toString()), // hardcap
            new anchor.BN(bigIntBuyerHardcap.toString()), // maxTokenAmountPerAddress
            new anchor.BN(tokenPrice), // price per token
            new anchor.BN(new Date("2024-06-24T07:48:00Z").getTime() / 1000), // start time
            new anchor.BN(new Date("2024-06-30T06:30:00Z").getTime() / 1000), // end time
            PRESALE_ID // presale id
          )
          .accounts({
            presaleInfo: presale_info,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("Successfully created presale.");
        return false;
      } catch (error: any) {
        console.log("error1: ", error);
        toast.error(error.toString());
        return false;
      } finally {
        setTransactionPending(false);
      }
    }
  };

  const withdrawSol = async () => {
    const transferAmount = 1 * LAMPORTS_PER_SOL;
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const [presale_info, presale_bump] = findProgramAddressSync(
          [
            utf8.encode(PRESALE_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );
        console.log("HHHHH - presale_info", presale_info.toString());

        const tx = await program.methods
          .withdrawSol( 
            new anchor.BN(transferAmount),
            PRESALE_ID // presale id
          )
          .accounts({
            presaleInfo: presale_info,
            presaleAuthority: PRESALE_AUTHORITY,
            buyerAuthority: publicKey,
            buyer: publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          })
          .rpc(
          );
        toast.success("Successfully withdrawed sol.");
        return false;
      } catch (error: any) {
        console.log(error);
        toast.error(error.toString());
        return false;
      } finally {
        setTransactionPending(false);
      }
    }
  };

  const updatePresale = async () => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const [presale_info, presale_bump] = findProgramAddressSync(
          [
            utf8.encode(PRESALE_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );

        const bigIntHardcap =
          BigInt(TOKEN_PRESALE_HARDCAP) * BigInt(10 ** TOKEN_DECIMAL);
        const bigIntBuyerHardcap =
          BigInt(BUYER_TOKEN_HARDCAP) * BigInt(10 ** TOKEN_DECIMAL);
        const tokenPrice = price_data.PRICE_PER_TOKEN * 10 ** TOKEN_DECIMAL;

        const tx = await program.methods
          .updatePresale(
            new anchor.BN(bigIntBuyerHardcap), // maxTokenAmountPerAddress
            new anchor.BN(tokenPrice), // pricePerToken
            new anchor.BN(10 ** TOKEN_DECIMAL), //softcapAmount
            new anchor.BN(bigIntHardcap), // hardcapAmount
            new anchor.BN(new Date("2024-06-24T07:48:00Z").getTime() / 1000), // start time
            new anchor.BN(new Date("2024-06-30T06:30:00Z").getTime() / 1000), // end time
            
            //new anchor.BN(new Date("2024-02-09T17:12:00Z").getTime() / 1000), // start time
            //new anchor.BN(new Date("2024-02-09T19:00:00Z").getTime() / 1000), // end time
            PRESALE_ID // presale id
          )
          .accounts({
            presaleInfo: presale_info,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("Successfully updated presale.");
        return false;
      } catch (error: any) {
        console.log(error);
        toast.error(error.toString());
        return false;
      } finally {
        setTransactionPending(false);
      }
    }
  };

  const updateAuth = async () => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const [presale_info, presale_bump] = findProgramAddressSync(
          [
            utf8.encode(PRESALE_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );

        const tx = await program.methods
          .updateAuth(
            PRESALE_ID // presale id
          )
          .accounts({
            presaleInfo: presale_info,
            newAuth: new PublicKey(
              "2EV4WTktLzoURVZ9nHGThyRKSu7QFf1DJ3S8Ze87frax"
            ),
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        toast.success("Successfully initialized user.");
        return false;
      } catch (error: any) {
        console.log(error);
        toast.error(error.toString());
        return false;
      } finally {
        setTransactionPending(false);
      }
    }
  };

  const depositToken = async () => {
    console.log("deposit")
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const [presale_info, presale_bump] = findProgramAddressSync(
          [
            utf8.encode(PRESALE_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );

        const fromAssociatedTokenAccount =
          await anchor.utils.token.associatedAddress({
            mint: token_mint_pubkey,
            owner: publicKey,
          });
          
        console.log("fromAssociatedtokenAccount: ", fromAssociatedTokenAccount.toString());

        const toAssociatedTokenAccount =
          await anchor.utils.token.associatedAddress({
            mint: token_mint_pubkey,
            owner: presale_info,
          });

        console.log("toAssociatedTokenAccount: ", toAssociatedTokenAccount.toString());

        // Use BigInt for large number calculations
        const depositAmount =
          TOKEN_PRESALE_HARDCAP * (10 ** TOKEN_DECIMAL);

        const tx = await program.methods
          .depositToken(
            new anchor.BN(depositAmount.toString()), // deposit amount
            PRESALE_ID // presale id
          )
          .accounts({
            mintAccount: TOKEN_PUBKEY,
            fromAssociatedTokenAccount,
            fromAuthority: publicKey,
            toAssociatedTokenAccount,
            presaleInfo: presale_info,
            payer: publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          })
          .rpc();
        toast.success("Successfully deposited token.");
        return false;
      } catch (error: any) {
        console.log(error);
        toast.error(error.toString());
        return false;
      } finally {
        setTransactionPending(false);
      }
    }
  };

  const buyToken = async (solBalance: number, tokenBalance: number) => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const [presaleInfo, presaleBump] = findProgramAddressSync(
          [
            utf8.encode(PRESALE_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );
        const [userInfo, userBump] = findProgramAddressSync(
          [
            utf8.encode(USER_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            publicKey.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );
        console.log(tokenBalance, solBalance)

        // Use BigInt for large number calculations
        const bigIntTokenAmount =
          tokenBalance * (10 ** TOKEN_DECIMAL);

        const bigIntSolAmount =
          solBalance * (10 ** TOKEN_DECIMAL);

        console.log(bigIntTokenAmount.toString(), bigIntSolAmount.toString())

        const tx = await program.methods
          .buyToken(
            new anchor.BN(bigIntTokenAmount.toString()), // token amount
            new anchor.BN(bigIntSolAmount.toString()), // sol amount = token amount * pricePerToken
            PRESALE_ID
          )
          .accounts({
            presaleInfo,
            presaleAuthority: PRESALE_AUTHORITY,
            userInfo,
            buyer: publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          })
          .rpc();
        toast.success("Token purchase was successful.");
        return false;
      } catch (error: any) {
        console.log(error);
        toast.error(error.toString());
        return false;
      } finally {
        setTransactionPending(false);
      }
    }
  };

  const claimToken = async () => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const [presaleInfo, presaleBump] = findProgramAddressSync(
          [
            utf8.encode(PRESALE_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );
        const [userInfo, userBump] = findProgramAddressSync(
          [
            utf8.encode(USER_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            publicKey.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );

        const buyer_presale_token_associated_token_account =
          await anchor.utils.token.associatedAddress({
            mint: TOKEN_PUBKEY,
            owner: publicKey,
          });

        const presale_presale_token_associated_token_account =
          await anchor.utils.token.associatedAddress({
            mint: TOKEN_PUBKEY,
            owner: presaleInfo,
          });

        const tx = await program.methods
          .claimToken(PRESALE_ID)
          .accounts({
            presaleTokenMintAccount: TOKEN_PUBKEY,
            buyerPresaleTokenAssociatedTokenAccount:
              buyer_presale_token_associated_token_account,
            presalePresaleTokenAssociatedTokenAccount:
              presale_presale_token_associated_token_account,
            userInfo,
            presaleInfo,
            presaleAuthority: PRESALE_AUTHORITY,
            buyerAuthority: publicKey,
            buyer: publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          })
          .rpc();
        toast.success("Token claim was successful.");
        return false;
      } catch (error: any) {
        console.log(error);
        toast.error(error.toString());
        return false;
      } finally {
        setTransactionPending(false);
      }
    }
  };

  const withdrawToken = async () => {
    if (program && publicKey) {
      try {
        setTransactionPending(true);
        const [presaleInfo, presaleBump] = findProgramAddressSync(
          [
            utf8.encode(PRESALE_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );
        const [userInfo, userBump] = findProgramAddressSync(
          [
            utf8.encode(USER_SEED),
            PRESALE_AUTHORITY.toBuffer(),
            publicKey.toBuffer(),
            new Uint8Array([PRESALE_ID]),
          ],
          program.programId
        );

        const buyer_presale_token_associated_token_account =
          await anchor.utils.token.associatedAddress({
            mint: TOKEN_PUBKEY,
            owner: publicKey,
          });

        const presale_presale_token_associated_token_account =
          await anchor.utils.token.associatedAddress({
            mint: TOKEN_PUBKEY,
            owner: presaleInfo,
          });

        const bigIntWithdrawAmount =
          BigInt(100) * BigInt(10 ** TOKEN_DECIMAL);

        const tx = await program.methods
          .withdrawToken(
            new anchor.BN(bigIntWithdrawAmount.toString()),
            PRESALE_ID
          )
          .accounts({
            presaleTokenMintAccount: TOKEN_PUBKEY,
            buyerPresaleTokenAssociatedTokenAccount:
              buyer_presale_token_associated_token_account,
            presalePresaleTokenAssociatedTokenAccount:
              presale_presale_token_associated_token_account,
            presaleInfo,
            presaleAuthority: PRESALE_AUTHORITY,
            buyerAuthority: publicKey,
            buyer: publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          })
          .rpc();
        toast.success("Token withdraw was successful.");
        return false;
      } catch (error: any) {
        console.log(error);
        toast.error(error.toString());
        return false;
      } finally {
        setTransactionPending(false);
      }
    }
  };

  return {
    createPresale,
    depositToken,
    buyToken,
    updatePresale,
    claimToken,
    withdrawSol,
    withdrawToken,
    updateAuth,
    startTime,
    endTime,
    buyAmount,
    totalBuyAmount,
    transactionPending,
  };
}
