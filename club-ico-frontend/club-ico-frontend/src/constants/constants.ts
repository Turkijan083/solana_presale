import { PublicKey } from "@solana/web3.js";

export const PRESALE_PROGRAM_PUBKEY = new PublicKey(
  "6KzkA1DDLdWUUWuqgArhRxf8doB7yiGV2L5Ueiyb8dzr"
);

export const TOKEN_PUBKEY = new PublicKey(
  "AvsW6d5AAhhKJq9MEcFsWkwxu77x4gnTFb3vbcozrTfW"
);

export const PRESALE_SEED = "MIRON_PRESALE_SEED";
export const USER_SEED = "MIRON_USER_SEED";
export const PRESALE_ID = 1;

export const PRESALE_AUTHORITY = new PublicKey(
  "4TJmioWPzZbUecToN6MgHHXpgp5szHuP9DX6Mkm246Za"
);

export const TOKEN_PRESALE_HARDCAP = 195000000; // token
export let price_data = {
  PRICE_PER_TOKEN : 0.0006 // cent
};

export const BUYER_SOFTCAP = 0.2; // sol
export const BUYER_HARDCAP = 100000; // sol
export const BUYER_TOKEN_HARDCAP = 195000000; // token

export const TOKEN_DECIMAL = 9;

export const token_mint_pubkey = new PublicKey(
    "AvsW6d5AAhhKJq9MEcFsWkwxu77x4gnTFb3vbcozrTfW"
);
export const token_owner_pubkey = new PublicKey(
    "4TJmioWPzZbUecToN6MgHHXpgp5szHuP9DX6Mkm246Za"
);

export const sol_program_pubkey = new PublicKey(
    "So11111111111111111111111111111111111111112"
);

export const TOKEN_PRICE1 = 0.0006;
export const TOKEN_PRICE2 = 0.0007;
export const TOKEN_PRICE3 = 0.0007;
export const TOKEN_PRICE4 = 0.0008;
export const TOKEN_PRICE5 = 0.0001;