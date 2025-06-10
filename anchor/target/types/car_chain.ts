/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/car_chain.json`.
 */
export type CarChain = {
  "address": "2HSinCzB6rzm5auGRiguh84EwBK6HG8r96gJHAsNt9Lh",
  "metadata": {
    "name": "carChain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acceptBuyRequest",
      "discriminator": [
        33,
        195,
        15,
        41,
        51,
        157,
        57,
        3
      ],
      "accounts": [
        {
          "name": "buyRequest",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  95,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              },
              {
                "kind": "arg",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "car",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  213,
                  203,
                  174,
                  72,
                  101,
                  187,
                  26,
                  156,
                  162,
                  106,
                  235,
                  120,
                  33,
                  172,
                  120,
                  64,
                  166,
                  161,
                  166,
                  250,
                  117,
                  121,
                  227,
                  15,
                  125,
                  123,
                  237,
                  33,
                  83,
                  26,
                  147,
                  157
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              }
            ]
          }
        },
        {
          "name": "ownerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "owner_pda.user_name",
                "account": "userAccount"
              }
            ]
          }
        },
        {
          "name": "buyerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "buyer_pda.user_name",
                "account": "userAccount"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "buyerAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vin",
          "type": "string"
        },
        {
          "name": "buyer",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "acceptConfirmityReport",
      "discriminator": [
        130,
        54,
        197,
        122,
        209,
        55,
        145,
        69
      ],
      "accounts": [
        {
          "name": "conformityReport",
          "writable": true
        },
        {
          "name": "car"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "car"
          ]
        }
      ],
      "args": [
        {
          "name": "reportId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "acceptReport",
      "discriminator": [
        126,
        236,
        199,
        215,
        130,
        49,
        73,
        50
      ],
      "accounts": [
        {
          "name": "report",
          "writable": true
        },
        {
          "name": "car"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "car"
          ]
        }
      ],
      "args": [
        {
          "name": "reportId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelForSale",
      "discriminator": [
        190,
        70,
        179,
        189,
        209,
        169,
        254,
        230
      ],
      "accounts": [
        {
          "name": "carAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  213,
                  203,
                  174,
                  72,
                  101,
                  187,
                  26,
                  156,
                  162,
                  106,
                  235,
                  120,
                  33,
                  172,
                  120,
                  64,
                  166,
                  161,
                  166,
                  250,
                  117,
                  121,
                  227,
                  15,
                  125,
                  123,
                  237,
                  33,
                  83,
                  26,
                  147,
                  157
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vin",
          "type": "string"
        }
      ]
    },
    {
      "name": "issueCarReport",
      "discriminator": [
        167,
        218,
        23,
        160,
        66,
        160,
        98,
        110
      ],
      "accounts": [
        {
          "name": "carReport",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "car"
              },
              {
                "kind": "account",
                "path": "inspectorSigner"
              },
              {
                "kind": "arg",
                "path": "reportId"
              }
            ]
          }
        },
        {
          "name": "car",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  213,
                  203,
                  174,
                  72,
                  101,
                  187,
                  26,
                  156,
                  162,
                  106,
                  235,
                  120,
                  33,
                  172,
                  120,
                  64,
                  166,
                  161,
                  166,
                  250,
                  117,
                  121,
                  227,
                  15,
                  125,
                  123,
                  237,
                  33,
                  83,
                  26,
                  147,
                  157
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              }
            ]
          }
        },
        {
          "name": "inspector"
        },
        {
          "name": "inspectorSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "reportId",
          "type": "u64"
        },
        {
          "name": "vin",
          "type": "string"
        },
        {
          "name": "overallCondition",
          "type": "u8"
        },
        {
          "name": "engineCondition",
          "type": "u8"
        },
        {
          "name": "bodyCondition",
          "type": "u8"
        },
        {
          "name": "fullReportUri",
          "type": "string"
        },
        {
          "name": "reportSummary",
          "type": "string"
        },
        {
          "name": "notes",
          "type": "string"
        }
      ]
    },
    {
      "name": "issueConfirmityReport",
      "discriminator": [
        136,
        200,
        122,
        12,
        19,
        28,
        22,
        135
      ],
      "accounts": [
        {
          "name": "conformityReport",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  111,
                  114,
                  109,
                  105,
                  116,
                  121,
                  95,
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "car"
              },
              {
                "kind": "account",
                "path": "confirmityExpertSigner"
              },
              {
                "kind": "arg",
                "path": "reportId"
              }
            ]
          }
        },
        {
          "name": "car",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  213,
                  203,
                  174,
                  72,
                  101,
                  187,
                  26,
                  156,
                  162,
                  106,
                  235,
                  120,
                  33,
                  172,
                  120,
                  64,
                  166,
                  161,
                  166,
                  250,
                  117,
                  121,
                  227,
                  15,
                  125,
                  123,
                  237,
                  33,
                  83,
                  26,
                  147,
                  157
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              }
            ]
          }
        },
        {
          "name": "confirmityExpert"
        },
        {
          "name": "confirmityExpertSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "reportId",
          "type": "u64"
        },
        {
          "name": "vin",
          "type": "string"
        },
        {
          "name": "conformityStatus",
          "type": "bool"
        },
        {
          "name": "modifications",
          "type": "string"
        },
        {
          "name": "fullReportUri",
          "type": "string"
        },
        {
          "name": "minesStamp",
          "type": "string"
        },
        {
          "name": "notes",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerCar",
      "discriminator": [
        57,
        224,
        53,
        202,
        102,
        187,
        107,
        159
      ],
      "accounts": [
        {
          "name": "car",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "government"
              },
              {
                "kind": "arg",
                "path": "vin"
              }
            ]
          }
        },
        {
          "name": "government",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "carId",
          "type": "string"
        },
        {
          "name": "vin",
          "type": "string"
        },
        {
          "name": "brand",
          "type": "string"
        },
        {
          "name": "model",
          "type": "string"
        },
        {
          "name": "year",
          "type": "u16"
        },
        {
          "name": "color",
          "type": "string"
        },
        {
          "name": "engineNumber",
          "type": "string"
        },
        {
          "name": "owner",
          "type": "pubkey"
        },
        {
          "name": "lastInspectionDate",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "inspectionStatus",
          "type": {
            "defined": {
              "name": "inspectionStatus"
            }
          }
        },
        {
          "name": "latestInspectionReport",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "mileage",
          "type": "u32"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "registerUser",
      "discriminator": [
        2,
        241,
        150,
        223,
        99,
        214,
        116,
        97
      ],
      "accounts": [
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "userSigner"
              },
              {
                "kind": "arg",
                "path": "userName"
              }
            ]
          }
        },
        {
          "name": "userSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userName",
          "type": "string"
        },
        {
          "name": "publicDataUri",
          "type": "string"
        },
        {
          "name": "privateDataUri",
          "type": "string"
        },
        {
          "name": "encryptedKeyForGov",
          "type": "string"
        },
        {
          "name": "encryptedKeyForUser",
          "type": "string"
        },
        {
          "name": "role",
          "type": {
            "defined": {
              "name": "userRoles"
            }
          }
        }
      ]
    },
    {
      "name": "rejectBuyRequest",
      "discriminator": [
        51,
        83,
        13,
        73,
        88,
        216,
        29,
        137
      ],
      "accounts": [
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "car",
          "writable": true
        },
        {
          "name": "buyRequest",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  95,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "buyer",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vin",
          "type": "string"
        }
      ]
    },
    {
      "name": "requestBuy",
      "discriminator": [
        193,
        121,
        33,
        50,
        5,
        139,
        217,
        133
      ],
      "accounts": [
        {
          "name": "buyRequest",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  95,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "car",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  213,
                  203,
                  174,
                  72,
                  101,
                  187,
                  26,
                  156,
                  162,
                  106,
                  235,
                  120,
                  33,
                  172,
                  120,
                  64,
                  166,
                  161,
                  166,
                  250,
                  117,
                  121,
                  227,
                  15,
                  125,
                  123,
                  237,
                  33,
                  83,
                  26,
                  147,
                  157
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              }
            ]
          }
        },
        {
          "name": "buyerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "buyer_pda.user_name",
                "account": "userAccount"
              }
            ]
          }
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vin",
          "type": "string"
        },
        {
          "name": "message",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "setForSale",
      "discriminator": [
        131,
        208,
        118,
        176,
        138,
        1,
        171,
        233
      ],
      "accounts": [
        {
          "name": "carAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  213,
                  203,
                  174,
                  72,
                  101,
                  187,
                  26,
                  156,
                  162,
                  106,
                  235,
                  120,
                  33,
                  172,
                  120,
                  64,
                  166,
                  161,
                  166,
                  250,
                  117,
                  121,
                  227,
                  15,
                  125,
                  123,
                  237,
                  33,
                  83,
                  26,
                  147,
                  157
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vin",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferCar",
      "discriminator": [
        135,
        190,
        247,
        136,
        102,
        22,
        79,
        82
      ],
      "accounts": [
        {
          "name": "car",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114
                ]
              },
              {
                "kind": "const",
                "value": [
                  213,
                  203,
                  174,
                  72,
                  101,
                  187,
                  26,
                  156,
                  162,
                  106,
                  235,
                  120,
                  33,
                  172,
                  120,
                  64,
                  166,
                  161,
                  166,
                  250,
                  117,
                  121,
                  227,
                  15,
                  125,
                  123,
                  237,
                  33,
                  83,
                  26,
                  147,
                  157
                ]
              },
              {
                "kind": "arg",
                "path": "vin"
              }
            ]
          }
        },
        {
          "name": "currentOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "newOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "newOwnerPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "newOwner"
              },
              {
                "kind": "arg",
                "path": "userName"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vin",
          "type": "string"
        },
        {
          "name": "userName",
          "type": "string"
        }
      ]
    },
    {
      "name": "verifyUser",
      "discriminator": [
        127,
        54,
        157,
        106,
        85,
        167,
        116,
        119
      ],
      "accounts": [
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user_account.authority",
                "account": "userAccount"
              },
              {
                "kind": "arg",
                "path": "userName"
              }
            ]
          }
        },
        {
          "name": "government",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "userName",
          "type": "string"
        },
        {
          "name": "approve",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "buyRequest",
      "discriminator": [
        175,
        29,
        113,
        183,
        180,
        108,
        205,
        201
      ]
    },
    {
      "name": "carAccount",
      "discriminator": [
        164,
        111,
        205,
        167,
        132,
        100,
        131,
        126
      ]
    },
    {
      "name": "carReport",
      "discriminator": [
        54,
        102,
        151,
        245,
        235,
        240,
        75,
        173
      ]
    },
    {
      "name": "conformityReport",
      "discriminator": [
        23,
        134,
        53,
        103,
        246,
        22,
        62,
        136
      ]
    },
    {
      "name": "userAccount",
      "discriminator": [
        211,
        33,
        136,
        16,
        186,
        110,
        242,
        127
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidReport",
      "msg": "Invalid report - car mismatch"
    },
    {
      "code": 6001,
      "name": "notAuthorizedConfirmityExpert",
      "msg": "Not authorized: user is not a conformity expert"
    },
    {
      "code": 6002,
      "name": "confirmityExpertNotVerified",
      "msg": "Conformity expert is not verified"
    },
    {
      "code": 6003,
      "name": "modificationsTooLong",
      "msg": "Modifications field too long"
    },
    {
      "code": 6004,
      "name": "stampTooLong",
      "msg": "Mines stamp field too long"
    },
    {
      "code": 6005,
      "name": "notesTooLong",
      "msg": "Notes field too long"
    }
  ],
  "types": [
    {
      "name": "buyRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vin",
            "type": "string"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "buyRequestStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "message",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "buyRequestStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "accepted"
          },
          {
            "name": "rejected"
          }
        ]
      }
    },
    {
      "name": "carAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "carId",
            "type": "string"
          },
          {
            "name": "vin",
            "type": "string"
          },
          {
            "name": "brand",
            "type": "string"
          },
          {
            "name": "model",
            "type": "string"
          },
          {
            "name": "year",
            "type": "u16"
          },
          {
            "name": "color",
            "type": "string"
          },
          {
            "name": "engineNumber",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "registeredBy",
            "type": "pubkey"
          },
          {
            "name": "registrationDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "transferCount",
            "type": "u32"
          },
          {
            "name": "lastInspectionDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "inspectionStatus",
            "type": {
              "defined": {
                "name": "inspectionStatus"
              }
            }
          },
          {
            "name": "latestInspectionReport",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "mileage",
            "type": "u32"
          },
          {
            "name": "isForSale",
            "type": "bool"
          },
          {
            "name": "salePrice",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "carReport",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reportId",
            "type": "u64"
          },
          {
            "name": "car",
            "type": "pubkey"
          },
          {
            "name": "inspector",
            "type": "pubkey"
          },
          {
            "name": "carOwner",
            "type": "pubkey"
          },
          {
            "name": "reportDate",
            "type": "i64"
          },
          {
            "name": "overallCondition",
            "type": "u8"
          },
          {
            "name": "engineCondition",
            "type": "u8"
          },
          {
            "name": "bodyCondition",
            "type": "u8"
          },
          {
            "name": "fullReportUri",
            "type": "string"
          },
          {
            "name": "reportSummary",
            "type": "string"
          },
          {
            "name": "approvedByOwner",
            "type": "bool"
          },
          {
            "name": "notes",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "conformityReport",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reportId",
            "type": "u64"
          },
          {
            "name": "car",
            "type": "pubkey"
          },
          {
            "name": "confirmityExpert",
            "type": "pubkey"
          },
          {
            "name": "carOwner",
            "type": "pubkey"
          },
          {
            "name": "reportDate",
            "type": "i64"
          },
          {
            "name": "conformityStatus",
            "type": "bool"
          },
          {
            "name": "modifications",
            "type": "string"
          },
          {
            "name": "minesStamp",
            "type": "string"
          },
          {
            "name": "fullReportUri",
            "type": "string"
          },
          {
            "name": "acceptedByOwner",
            "type": "bool"
          },
          {
            "name": "notes",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "inspectionStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "passed"
          },
          {
            "name": "failed"
          },
          {
            "name": "expired"
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "userName",
            "type": "string"
          },
          {
            "name": "publicDataUri",
            "type": "string"
          },
          {
            "name": "privateDataUri",
            "type": "string"
          },
          {
            "name": "encryptedKeyForGov",
            "type": "string"
          },
          {
            "name": "encryptedKeyForUser",
            "type": "string"
          },
          {
            "name": "role",
            "type": {
              "defined": {
                "name": "userRoles"
              }
            }
          },
          {
            "name": "verificationStatus",
            "type": {
              "defined": {
                "name": "verificationStatus"
              }
            }
          },
          {
            "name": "verifiedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "verifiedBy",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userRoles",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "normal"
          },
          {
            "name": "inspector"
          },
          {
            "name": "confirmityExpert"
          },
          {
            "name": "government"
          }
        ]
      }
    },
    {
      "name": "verificationStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "verified"
          },
          {
            "name": "rejected"
          }
        ]
      }
    }
  ]
};
