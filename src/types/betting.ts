/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/betting.json`.
 */
export type Betting = {
    "address": "6W1ReqRjnLTNyT4jAbexbAr1s2Qq2Ewa57pvPX6mhncm",
    "metadata": {
      "name": "betting",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "claimWinnings",
        "discriminator": [
          161,
          215,
          24,
          59,
          14,
          236,
          242,
          221
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "bet",
            "writable": true
          },
          {
            "name": "userBet",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    117,
                    115,
                    101,
                    114,
                    95,
                    98,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                },
                {
                  "kind": "account",
                  "path": "user"
                }
              ]
            }
          },
          {
            "name": "vaultAuthority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                }
              ]
            }
          },
          {
            "name": "vaultTokenAccount",
            "writable": true
          },
          {
            "name": "userTokenAccount",
            "writable": true
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ],
        "args": []
      },
      {
        "name": "createBet",
        "discriminator": [
          197,
          42,
          153,
          2,
          59,
          63,
          143,
          246
        ],
        "accounts": [
          {
            "name": "signer",
            "writable": true,
            "signer": true
          },
          {
            "name": "bet",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "arg",
                  "path": "title"
                }
              ]
            }
          },
          {
            "name": "vaultAuthority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                }
              ]
            }
          },
          {
            "name": "vaultTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    116,
                    111,
                    107,
                    101,
                    110,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                }
              ]
            }
          },
          {
            "name": "tokenMint"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "betAmount",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "i64"
          }
        ]
      },
      {
        "name": "placeBet",
        "discriminator": [
          222,
          62,
          67,
          220,
          63,
          166,
          126,
          33
        ],
        "accounts": [
          {
            "name": "bettor",
            "writable": true,
            "signer": true
          },
          {
            "name": "bet",
            "writable": true
          },
          {
            "name": "userBet",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    117,
                    115,
                    101,
                    114,
                    95,
                    98,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                },
                {
                  "kind": "account",
                  "path": "bettor"
                }
              ]
            }
          },
          {
            "name": "bettorTokenAccount",
            "writable": true
          },
          {
            "name": "vaultTokenAccount",
            "writable": true
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "betDirection",
            "type": "bool"
          }
        ]
      },
      {
        "name": "resolveBet",
        "discriminator": [
          137,
          132,
          33,
          97,
          48,
          208,
          30,
          159
        ],
        "accounts": [
          {
            "name": "bet",
            "writable": true
          },
          {
            "name": "creator",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "outcome",
            "type": "bool"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "bet",
        "discriminator": [
          147,
          23,
          35,
          59,
          15,
          75,
          155,
          32
        ]
      },
      {
        "name": "userBet",
        "discriminator": [
          180,
          131,
          8,
          241,
          60,
          243,
          46,
          63
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "betAlreadyResolved",
        "msg": "Bet has already been resolved"
      },
      {
        "code": 6001,
        "name": "betEndTimeExceeded",
        "msg": "Bet end time has been exceeded"
      },
      {
        "code": 6002,
        "name": "betNotEndedYet",
        "msg": "Bet has not ended yet"
      },
      {
        "code": 6003,
        "name": "betNotResolved",
        "msg": "Bet has not been resolved yet"
      },
      {
        "code": 6004,
        "name": "alreadyClaimed",
        "msg": "Winnings have already been claimed"
      },
      {
        "code": 6005,
        "name": "notAWinner",
        "msg": "User did not win this bet"
      },
      {
        "code": 6006,
        "name": "invalidVault",
        "msg": "Invalid vault token account"
      }
    ],
    "types": [
      {
        "name": "bet",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "creator",
              "type": "pubkey"
            },
            {
              "name": "title",
              "type": "string"
            },
            {
              "name": "betAmount",
              "type": "u64"
            },
            {
              "name": "totalYesAmount",
              "type": "u64"
            },
            {
              "name": "totalNoAmount",
              "type": "u64"
            },
            {
              "name": "yesBettors",
              "type": "u64"
            },
            {
              "name": "noBettors",
              "type": "u64"
            },
            {
              "name": "endTime",
              "type": "i64"
            },
            {
              "name": "resolved",
              "type": "bool"
            },
            {
              "name": "outcome",
              "type": "bool"
            },
            {
              "name": "tokenMint",
              "type": "pubkey"
            },
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "bump",
              "type": "u8"
            },
            {
              "name": "bumpVaultAuthority",
              "type": "u8"
            },
            {
              "name": "bumpVaultTa",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "userBet",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "user",
              "type": "pubkey"
            },
            {
              "name": "bet",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "direction",
              "type": "bool"
            },
            {
              "name": "claimed",
              "type": "bool"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ]
};

export const IDL = {
    "address": "6W1ReqRjnLTNyT4jAbexbAr1s2Qq2Ewa57pvPX6mhncm",
    "metadata": {
      "name": "betting",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "claim_winnings",
        "discriminator": [
          161,
          215,
          24,
          59,
          14,
          236,
          242,
          221
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "bet",
            "writable": true
          },
          {
            "name": "user_bet",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    117,
                    115,
                    101,
                    114,
                    95,
                    98,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                },
                {
                  "kind": "account",
                  "path": "user"
                }
              ]
            }
          },
          {
            "name": "vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                }
              ]
            }
          },
          {
            "name": "vault_token_account",
            "writable": true
          },
          {
            "name": "user_token_account",
            "writable": true
          },
          {
            "name": "token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          }
        ],
        "args": []
      },
      {
        "name": "create_bet",
        "discriminator": [
          197,
          42,
          153,
          2,
          59,
          63,
          143,
          246
        ],
        "accounts": [
          {
            "name": "signer",
            "writable": true,
            "signer": true
          },
          {
            "name": "bet",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "arg",
                  "path": "title"
                }
              ]
            }
          },
          {
            "name": "vault_authority",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                }
              ]
            }
          },
          {
            "name": "vault_token_account",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116,
                    95,
                    116,
                    111,
                    107,
                    101,
                    110,
                    95,
                    97,
                    99,
                    99,
                    111,
                    117,
                    110,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                }
              ]
            }
          },
          {
            "name": "token_mint"
          },
          {
            "name": "token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "bet_amount",
            "type": "u64"
          },
          {
            "name": "end_time",
            "type": "i64"
          }
        ]
      },
      {
        "name": "place_bet",
        "discriminator": [
          222,
          62,
          67,
          220,
          63,
          166,
          126,
          33
        ],
        "accounts": [
          {
            "name": "bettor",
            "writable": true,
            "signer": true
          },
          {
            "name": "bet",
            "writable": true
          },
          {
            "name": "user_bet",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    117,
                    115,
                    101,
                    114,
                    95,
                    98,
                    101,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "bet"
                },
                {
                  "kind": "account",
                  "path": "bettor"
                }
              ]
            }
          },
          {
            "name": "bettor_token_account",
            "writable": true
          },
          {
            "name": "vault_token_account",
            "writable": true
          },
          {
            "name": "token_program",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "system_program",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "bet_direction",
            "type": "bool"
          }
        ]
      },
      {
        "name": "resolve_bet",
        "discriminator": [
          137,
          132,
          33,
          97,
          48,
          208,
          30,
          159
        ],
        "accounts": [
          {
            "name": "bet",
            "writable": true
          },
          {
            "name": "creator",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "outcome",
            "type": "bool"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "Bet",
        "discriminator": [
          147,
          23,
          35,
          59,
          15,
          75,
          155,
          32
        ]
      },
      {
        "name": "UserBet",
        "discriminator": [
          180,
          131,
          8,
          241,
          60,
          243,
          46,
          63
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "BetAlreadyResolved",
        "msg": "Bet has already been resolved"
      },
      {
        "code": 6001,
        "name": "BetEndTimeExceeded",
        "msg": "Bet end time has been exceeded"
      },
      {
        "code": 6002,
        "name": "BetNotEndedYet",
        "msg": "Bet has not ended yet"
      },
      {
        "code": 6003,
        "name": "BetNotResolved",
        "msg": "Bet has not been resolved yet"
      },
      {
        "code": 6004,
        "name": "AlreadyClaimed",
        "msg": "Winnings have already been claimed"
      },
      {
        "code": 6005,
        "name": "NotAWinner",
        "msg": "User did not win this bet"
      },
      {
        "code": 6006,
        "name": "InvalidVault",
        "msg": "Invalid vault token account"
      }
    ],
    "types": [
      {
        "name": "Bet",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "creator",
              "type": "pubkey"
            },
            {
              "name": "title",
              "type": "string"
            },
            {
              "name": "bet_amount",
              "type": "u64"
            },
            {
              "name": "total_yes_amount",
              "type": "u64"
            },
            {
              "name": "total_no_amount",
              "type": "u64"
            },
            {
              "name": "yes_bettors",
              "type": "u64"
            },
            {
              "name": "no_bettors",
              "type": "u64"
            },
            {
              "name": "end_time",
              "type": "i64"
            },
            {
              "name": "resolved",
              "type": "bool"
            },
            {
              "name": "outcome",
              "type": "bool"
            },
            {
              "name": "token_mint",
              "type": "pubkey"
            },
            {
              "name": "vault",
              "type": "pubkey"
            },
            {
              "name": "bump",
              "type": "u8"
            },
            {
              "name": "bump_vault_authority",
              "type": "u8"
            },
            {
              "name": "bump_vault_ta",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "UserBet",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "user",
              "type": "pubkey"
            },
            {
              "name": "bet",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "direction",
              "type": "bool"
            },
            {
              "name": "claimed",
              "type": "bool"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ]
}