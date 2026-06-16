// Web3 Glossary — sourced from HackQuest + governance forums
export const GLOSSARY_TERMS = [
  // ── A ──
  { term: 'Airdrop', category: 'Basics', letter: 'A', definition: 'Free distribution of crypto or NFTs to wallets to promote a project or reward early users.' },
  { term: 'Algorithm', category: 'Basics', letter: 'A', definition: 'The set of rules governing how a blockchain operates, like Proof of Work or Proof of Stake.' },
  { term: 'AML (Anti-Money Laundering)', category: 'Compliance', letter: 'A', definition: 'Laws, regulations, and procedures designed to prevent criminals from disguising illegal funds as legitimate income.' },
  { term: 'API (Application Programming Interface)', category: 'Dev', letter: 'A', definition: 'A set of protocols allowing different software applications to communicate with each other.' },
  { term: 'Account Abstraction', category: 'Dev', letter: 'A', definition: 'An advancement that removes the distinction between externally owned accounts and smart contract accounts, making wallets programmable.' },
  { term: 'Address', category: 'Basics', letter: 'A', definition: 'A unique identifier on a blockchain, similar to a bank account number, holding crypto and interacting with dApps.' },
  { term: 'Altcoin', category: 'DeFi', letter: 'A', definition: 'Any cryptocurrency other than Bitcoin.' },
  { term: 'Algorithmic Stablecoin', category: 'DeFi', letter: 'A', definition: 'A crypto whose value is algorithmically maintained near a target price, often using another asset as collateral.' },
  { term: 'Atomic Swap', category: 'DeFi', letter: 'A', definition: 'Smart contract technology enabling the exchange of one cryptocurrency for another without a centralized intermediary.' },
  { term: 'Arbitrage', category: 'DeFi', letter: 'A', definition: 'Taking advantage of price differences between two or more markets to generate risk-free profit.' },
  { term: 'AppChain', category: 'Dev', letter: 'A', definition: 'A specialized blockchain dedicated to a specific community or application, optimized for particular use cases.' },
  { term: 'All-Time High (ATH)', category: 'DeFi', letter: 'A', definition: 'The highest price level a cryptocurrency has ever reached since its inception.' },
  { term: 'All-Time Low (ATL)', category: 'DeFi', letter: 'A', definition: 'The lowest price level a cryptocurrency token has ever reached since its inception.' },
  // ── B ──
  { term: 'Blockchain', category: 'Basics', letter: 'B', definition: 'A distributed, tamper-proof digital ledger that records transactions across a network of computers.' },
  { term: 'Block', category: 'Dev', letter: 'B', definition: 'A bundle of verified transactions grouped together and added permanently to the blockchain.' },
  { term: 'Block Reward', category: 'Dev', letter: 'B', definition: 'The incentive awarded to miners or validators for verifying transactions and adding new blocks.' },
  { term: 'Block Time', category: 'Dev', letter: 'B', definition: 'The average time it takes to add a new block to a blockchain.' },
  { term: 'Block Explorer', category: 'Dev', letter: 'B', definition: 'A tool to search and view information about blocks, transactions, and addresses on a blockchain.' },
  { term: 'Blockchain Trilemma', category: 'Dev', letter: 'B', definition: 'The challenge of balancing scalability, security, and decentralization — achieving all three simultaneously is enormously difficult.' },
  { term: 'Bridge', category: 'Basics', letter: 'B', definition: 'A tool facilitating the transfer of assets between different blockchain networks.' },
  { term: 'Bull Market', category: 'DeFi', letter: 'B', definition: 'A prolonged period of rising crypto prices and optimistic market sentiment.' },
  { term: 'Bear Market', category: 'DeFi', letter: 'B', definition: 'A prolonged period of declining crypto prices and negative market sentiment.' },
  { term: 'Burned Tokens', category: 'DeFi', letter: 'B', definition: 'Removing tokens permanently from circulation by sending them to an unspendable address, reducing supply.' },
  { term: 'Bounty', category: 'Basics', letter: 'B', definition: 'A reward offered for completing specific tasks such as finding bugs, building features, or promoting a project.' },
  { term: 'BUIDL', category: 'Slang', letter: 'B', definition: 'Crypto slang for "build" — encouraging developers to keep building in the Web3 space regardless of market conditions.' },
  // ── C ──
  { term: 'Cryptocurrency', category: 'Basics', letter: 'C', definition: 'A digital asset using cryptography for security, designed to function as a medium of exchange in a decentralized network.' },
  { term: 'Consensus', category: 'Dev', letter: 'C', definition: 'The agreement mechanism used by a blockchain network to validate transactions and maintain a shared state.' },
  { term: 'Composability', category: 'Dev', letter: 'C', definition: 'The ability of different dApps and smart contracts to interact and build upon each other like Lego blocks.' },
  { term: 'Central Bank Digital Currency (CBDC)', category: 'DeFi', letter: 'C', definition: 'A digital currency issued and backed by a central bank, existing solely in electronic form.' },
  { term: 'Circulating Supply', category: 'DeFi', letter: 'C', definition: 'The total amount of a cryptocurrency currently available for trading and use in the market.' },
  { term: 'Cold Wallet', category: 'Basics', letter: 'C', definition: 'A hardware device for storing cryptocurrency offline, providing greater security than hot wallets.' },
  { term: 'Cryptography', category: 'DeFi', letter: 'C', definition: 'The science of secure communication using codes and algorithms to encrypt and decrypt information.' },
  { term: 'Custody', category: 'DeFi', letter: 'C', definition: 'The holding and safeguarding of cryptocurrency by a third party, such as an exchange or institutional custodian.' },
  // ── D ──
  { term: 'DAO (Decentralized Autonomous Organization)', category: 'Governance', letter: 'D', definition: 'A community-driven organization governed by smart contracts and token-based voting, operating without a central authority.' },
  { term: 'DeFi (Decentralized Finance)', category: 'DeFi', letter: 'D', definition: 'A financial system built on blockchain, offering lending, borrowing, and trading without traditional intermediaries.' },
  { term: 'dApp (Decentralized App)', category: 'Dev', letter: 'D', definition: 'An application built on a blockchain network, offering functionality without a single point of control.' },
  { term: 'Decentralization', category: 'Basics', letter: 'D', definition: 'The distribution of control and decision-making across a network rather than relying on a single entity.' },
  { term: 'DEX (Decentralized Exchange)', category: 'DeFi', letter: 'D', definition: 'A cryptocurrency exchange operating on a blockchain, eliminating the need for centralized intermediaries.' },
  { term: 'Digital Asset', category: 'Basics', letter: 'D', definition: 'Any intangible asset existing in digital form, including cryptocurrencies, NFTs, and other tokens.' },
  { term: 'Digital Signature', category: 'Basics', letter: 'D', definition: 'A cryptographic technique used to authenticate the identity of a sender and ensure data integrity.' },
  { term: 'Delegated Proof-of-Stake (dPOS)', category: 'Dev', letter: 'D', definition: 'A consensus mechanism where token holders delegate their voting power to elected validators who secure the network.' },
  { term: 'Double Spend', category: 'Dev', letter: 'D', definition: 'Attempting to illegitimately spend the same digital asset twice, a problem solved by blockchain consensus.' },
  { term: 'Data Availability', category: 'Dev', letter: 'D', definition: 'Ensuring all network participants can access and verify the data needed to validate blockchain state transitions.' },
  { term: 'DYOR (Do Your Own Research)', category: 'Slang', letter: 'D', definition: 'A crucial principle in Web3, emphasizing personal research and critical thinking before making investment decisions.' },
  { term: 'Degen', category: 'Slang', letter: 'D', definition: 'Crypto slang for someone who makes high-risk, speculative bets, often in DeFi or meme coin markets.' },
  // ── E ──
  { term: 'Ethereum', category: 'Basics', letter: 'E', definition: 'A decentralized, open-source blockchain platform known for smart contracts and the vast ecosystem built on it.' },
  { term: 'EVM (Ethereum Virtual Machine)', category: 'Dev', letter: 'E', definition: 'A runtime environment that executes smart contracts on Ethereum and EVM-compatible blockchains.' },
  { term: 'ERC-20', category: 'Dev', letter: 'E', definition: 'The standard interface for fungible tokens on Ethereum, defining a common set of rules all tokens must follow.' },
  { term: 'ERC-721', category: 'NFT', letter: 'E', definition: 'The standard for non-fungible tokens (NFTs) on Ethereum, ensuring unique ownership and transferability.' },
  { term: 'ERC-1155', category: 'NFT', letter: 'E', definition: 'A token standard enabling both fungible and non-fungible tokens within a single smart contract.' },
  { term: 'ENS (Ethereum Name Service)', category: 'Dev', letter: 'E', definition: 'A blockchain-based system for assigning human-readable names (like alice.eth) to Ethereum addresses.' },
  { term: 'Encryption', category: 'Dev', letter: 'E', definition: 'The process of converting data into an unreadable format using cryptography, requiring a key to decrypt.' },
  { term: 'Epoch', category: 'Dev', letter: 'E', definition: 'A specific time period in a blockchain network, used for tracking staking rewards, validator sets, or protocol updates.' },
  { term: 'Exchange', category: 'Basics', letter: 'E', definition: 'A platform where users can buy, sell, and trade cryptocurrencies or other digital assets.' },
  // ── F ──
  { term: 'Fork', category: 'Dev', letter: 'F', definition: 'A branching point in a blockchain where the network splits into two chains, usually due to protocol changes.' },
  { term: 'Fiat Currency', category: 'DeFi', letter: 'F', definition: 'Traditional government-issued currency (like USD or EUR), not backed by a physical commodity.' },
  { term: 'Finality', category: 'Basics', letter: 'F', definition: 'The confirmation and irreversible inclusion of a transaction in a blockchain, ensuring it cannot be reversed.' },
  { term: 'Front Running', category: 'DeFi', letter: 'F', definition: 'Taking advantage of advance knowledge of pending transactions to execute trades first for profit.' },
  { term: 'Fully Diluted Valuation', category: 'DeFi', letter: 'F', definition: 'The total market cap of a cryptocurrency if all possible tokens were in circulation.' },
  { term: 'Futures', category: 'DeFi', letter: 'F', definition: 'Contracts to buy or sell an asset at a predetermined price in the future, used for speculation or hedging.' },
  { term: 'FOMO (Fear of Missing Out)', category: 'Slang', letter: 'F', definition: 'The anxiety of missing out on a potential opportunity, often leading to impulsive investment decisions.' },
  { term: 'FUD (Fear, Uncertainty and Doubt)', category: 'Slang', letter: 'F', definition: 'Spreading negative or misleading information to manipulate prices or sentiment in the crypto market.' },
  // ── G ──
  { term: 'Gas', category: 'Basics', letter: 'G', definition: 'The unit measuring computational effort required to execute operations on the Ethereum network.' },
  { term: 'Gas Fee', category: 'Dev', letter: 'G', definition: 'The amount of ETH paid to miners or validators for processing a transaction on the blockchain.' },
  { term: 'Genesis Block', category: 'Dev', letter: 'G', definition: 'The very first block created on a blockchain, marking the starting point of the entire chain.' },
  { term: 'Governance', category: 'Governance', letter: 'G', definition: 'The systems and processes by which decisions are made in a DAO or blockchain protocol, typically through token voting.' },
  { term: 'Governance Token', category: 'Governance', letter: 'G', definition: 'A token that grants holders the right to vote on protocol changes, treasury spending, and other governance decisions.' },
  // ── H ──
  { term: 'Hash', category: 'Basics', letter: 'H', definition: 'A unique fixed-length identifier generated from data using a cryptographic function, ensuring data integrity.' },
  { term: 'Hashrate', category: 'Basics', letter: 'H', definition: 'The combined computing power used to secure a Proof-of-Work blockchain network.' },
  { term: 'Halving', category: 'Basics', letter: 'H', definition: 'A scheduled event in Bitcoin where the block reward for miners is cut in half, reducing new supply.' },
  { term: 'Hard Fork', category: 'Dev', letter: 'H', definition: 'A significant, backward-incompatible protocol change that creates two separate blockchain chains.' },
  { term: 'Hardware Wallet', category: 'DeFi', letter: 'H', definition: 'A physical device for storing cryptocurrency private keys offline, protecting against online attacks.' },
  { term: 'Hot Wallet', category: 'DeFi', letter: 'H', definition: 'A cryptocurrency wallet connected to the internet, offering convenience at the cost of higher security risk.' },
  { term: 'HODL', category: 'Slang', letter: 'H', definition: 'Crypto slang for "hold on for dear life" — encouraging long-term holding despite price volatility.' },
  // ── I ──
  { term: 'Interoperability', category: 'Basics', letter: 'I', definition: 'The ability of different blockchain networks to communicate and exchange data with each other.' },
  { term: 'ICO (Initial Coin Offering)', category: 'DeFi', letter: 'I', definition: 'A fundraising method where a project sells new tokens to the public to raise development capital.' },
  { term: 'Impermanent Loss', category: 'DeFi', letter: 'I', definition: 'A potential decrease in liquidity provider value due to price divergence between deposited assets.' },
  { term: 'IPFS (InterPlanetary File System)', category: 'DeFi', letter: 'I', definition: 'A decentralized peer-to-peer file storage system for efficient and censorship-resistant data storage.' },
  { term: 'Immutability', category: 'Dev', letter: 'I', definition: 'The characteristic of blockchain data being permanently recorded and tamper-proof.' },
  // ── J ──
  { term: 'JSON-RPC', category: 'Dev', letter: 'J', definition: 'A protocol for remote procedure calls using JSON format, commonly used for interacting with blockchain nodes.' },
  // ── K ──
  { term: 'KYC (Know Your Customer)', category: 'Compliance', letter: 'K', definition: 'Regulations requiring identity verification for users of financial platforms, including crypto exchanges.' },
  // ── L ──
  { term: 'Layer 2', category: 'Basics', letter: 'L', definition: 'Scaling solutions built on top of a base blockchain to process transactions faster and cheaper.' },
  { term: 'Liquidity', category: 'DeFi', letter: 'L', definition: 'The ease with which an asset can be bought or sold in the market without significantly impacting its price.' },
  { term: 'Liquid Staking', category: 'DeFi', letter: 'L', definition: 'Staking tokens while receiving a liquid receipt token that can be used in DeFi, keeping assets productive.' },
  { term: 'Leverage', category: 'DeFi', letter: 'L', definition: 'Using borrowed funds to amplify potential returns (or losses) in cryptocurrency trading.' },
  // ── M ──
  { term: 'Mining', category: 'Basics', letter: 'M', definition: 'The process of securing a Proof-of-Work blockchain by solving computational puzzles and earning block rewards.' },
  { term: 'Mainnet', category: 'Dev', letter: 'M', definition: 'The live, public version of a blockchain network where real transactions occur with real value.' },
  { term: 'Mint', category: 'Dev', letter: 'M', definition: 'The process of creating new NFTs or tokens on a blockchain, adding them to the total supply.' },
  { term: 'Multisig (Multi-signature)', category: 'Dev', letter: 'M', definition: 'A security feature requiring multiple private keys to authorize a transaction, used heavily in DAOs.' },
  { term: 'Metaverse', category: 'Basics', letter: 'M', definition: 'Immersive virtual worlds and experiences, increasingly integrated with blockchain ownership and identity.' },
  // ── N ──
  { term: 'NFT (Non-Fungible Token)', category: 'NFT', letter: 'N', definition: 'A unique digital asset on a blockchain, representing ownership of a specific item — art, music, or in-game items.' },
  { term: 'Node', category: 'Dev', letter: 'N', definition: 'A computer participating in a blockchain network that stores, validates, and broadcasts transactions.' },
  { term: 'Nonce', category: 'Dev', letter: 'N', definition: 'A number used once in cryptographic communication — in PoW it is the number miners iterate to find a valid hash.' },
  // ── O ──
  { term: 'On-Chain Governance', category: 'Governance', letter: 'O', definition: 'Governance where proposals and votes are recorded directly on the blockchain, ensuring full transparency.' },
  { term: 'Off-Chain Governance', category: 'Governance', letter: 'O', definition: 'Governance processes that happen outside the blockchain, such as community forums and Discord.' },
  { term: 'Oracle', category: 'Dev', letter: 'O', definition: 'A service that connects smart contracts with real-world data — like prices, weather, or sports results.' },
  { term: 'Optimistic Rollup', category: 'Dev', letter: 'O', definition: 'A Layer 2 scaling solution that assumes transactions are valid by default, with a fraud-proof challenge period.' },
  // ── P ──
  { term: 'Private Key', category: 'Basics', letter: 'P', definition: 'A secret cryptographic key giving complete control over a wallet. Never share it — whoever holds it, owns the funds.' },
  { term: 'Public Key', category: 'Basics', letter: 'P', definition: 'A cryptographic key derived from a private key, used as the basis for a blockchain wallet address.' },
  { term: 'Proof of Work (PoW)', category: 'Dev', letter: 'P', definition: 'A consensus mechanism where miners compete to solve cryptographic puzzles to validate blocks, used by Bitcoin.' },
  { term: 'Proof of Stake (PoS)', category: 'Dev', letter: 'P', definition: 'A consensus mechanism where validators stake cryptocurrency as collateral to earn the right to validate blocks.' },
  { term: 'Protocol', category: 'Dev', letter: 'P', definition: 'A set of rules and standards governing interactions within a blockchain network or dApp ecosystem.' },
  { term: 'Proposal', category: 'Governance', letter: 'P', definition: 'A formal suggestion submitted to a DAO for community consideration, discussion, and on-chain voting.' },
  // ── Q ──
  { term: 'Quorum', category: 'Governance', letter: 'Q', definition: 'The minimum participation threshold required for a DAO vote to be considered valid and binding.' },
  { term: 'Quadratic Voting', category: 'Governance', letter: 'Q', definition: 'A voting system where the cost of additional votes increases quadratically, reducing plutocratic concentration of power.' },
  // ── R ──
  { term: 'Rollup', category: 'Dev', letter: 'R', definition: 'A Layer 2 scaling technique that bundles many transactions into one and submits a compressed proof to the base chain.' },
  { term: 'Rug Pull', category: 'DeFi', letter: 'R', definition: 'A scam where developers abandon a project and steal investor funds after attracting significant liquidity.' },
  // ── S ──
  { term: 'Smart Contract', category: 'Basics', letter: 'S', definition: 'Self-executing code on a blockchain that automatically enforces predefined rules when conditions are met.' },
  { term: 'Stablecoin', category: 'DeFi', letter: 'S', definition: 'A cryptocurrency pegged to a stable asset (like USD) to minimize price volatility.' },
  { term: 'Staking', category: 'DeFi', letter: 'S', definition: 'Locking cryptocurrency as collateral to participate in network validation and earn staking rewards.' },
  { term: 'Seed Phrase', category: 'Basics', letter: 'S', definition: 'A 12 or 24-word recovery phrase that can restore a crypto wallet. Losing it means losing access forever.' },
  { term: 'Sidechain', category: 'Dev', letter: 'S', definition: 'A separate blockchain connected to a main chain, enabling asset transfers and specialized functionality.' },
  { term: 'Sharding', category: 'Dev', letter: 'S', definition: 'A database partitioning technique applied to blockchains to distribute data and increase throughput.' },
  { term: 'Slashing', category: 'Dev', letter: 'S', definition: 'A penalty mechanism in Proof of Stake networks that destroys a portion of a validator\'s stake for malicious behavior.' },
  // ── T ──
  { term: 'Token', category: 'Basics', letter: 'T', definition: 'A digital asset built on an existing blockchain, representing anything from currency to voting rights to ownership.' },
  { term: 'Tokenomics', category: 'DeFi', letter: 'T', definition: 'The economic design of a token — including supply, distribution, utility, and incentive mechanisms.' },
  { term: 'Treasury', category: 'Governance', letter: 'T', definition: 'The collective funds managed by a DAO, used to fund development, grants, and community initiatives.' },
  { term: 'Testnet', category: 'Dev', letter: 'T', definition: 'A sandbox version of a blockchain for testing and development, using tokens with no real-world value.' },
  { term: 'TVL (Total Value Locked)', category: 'DeFi', letter: 'T', definition: 'The total value of cryptocurrency deposited in a DeFi protocol, used as a measure of its adoption and health.' },
  // ── U ──
  { term: 'UBI (Universal Basic Income)', category: 'DeFi', letter: 'U', definition: 'Regular, unconditional payments to individuals — GoodDollar implements this concept using blockchain.' },
  // ── V ──
  { term: 'Validator', category: 'Dev', letter: 'V', definition: 'A node in a Proof of Stake blockchain responsible for verifying transactions and proposing new blocks.' },
  { term: 'Vesting', category: 'DeFi', letter: 'V', definition: 'A time-locked mechanism that releases tokens gradually, preventing founders or investors from dumping immediately.' },
  // ── W ──
  { term: 'Wallet', category: 'Basics', letter: 'W', definition: 'Software or hardware that stores your cryptographic keys and allows you to interact with the blockchain.' },
  { term: 'Web3', category: 'Basics', letter: 'W', definition: 'The next iteration of the internet, built on decentralized blockchain networks, enabling user ownership of data and assets.' },
  { term: 'Whitepaper', category: 'Basics', letter: 'W', definition: 'A technical document released by a blockchain project that explains the problem, solution, and tokenomics.' },
  // ── Y ──
  { term: 'Yield Farming', category: 'DeFi', letter: 'Y', definition: 'The practice of maximizing returns by moving crypto assets between DeFi protocols to earn the highest yield.' },
  // ── Z ──
  { term: 'Zero-Knowledge Proof (ZKP)', category: 'Dev', letter: 'Z', definition: 'A cryptographic method that allows one party to prove knowledge of something without revealing the information itself.' },
  { term: 'ZK Rollup', category: 'Dev', letter: 'Z', definition: 'A Layer 2 scaling solution that uses zero-knowledge proofs to batch and validate transactions off-chain.' },
];

// Category colors for tags
export const CATEGORY_COLORS = {
  'Basics': '#2dd4bf',
  'DeFi': '#a855f7',
  'Dev': '#3b82f6',
  'Governance': '#f59e0b',
  'NFT': '#ec4899',
  'Compliance': '#6366f1',
  'Slang': '#64748b',
};

// All categories
export const GLOSSARY_CATEGORIES = ['All', 'Basics', 'DeFi', 'Dev', 'Governance', 'NFT', 'Compliance', 'Slang'];

// Letters with content
export const GLOSSARY_LETTERS = [...new Set(GLOSSARY_TERMS.map(t => t.letter))].sort();

// Governance Forums — authentic DAO platforms only
export const GOVERNANCE_FORUMS = [
  {
    name: 'Uniswap Governance',
    url: 'https://gov.uniswap.org',
    description: 'Discussions and proposals for the Uniswap protocol and UNI treasury.',
    category: 'DeFi',
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=025',
    fallback: 'U',
    color: '#ff007a'
  },
  {
    name: 'Compound Governance',
    url: 'https://www.comp.xyz',
    description: 'Community forum for COMP holders to discuss and vote on Compound protocol changes.',
    category: 'DeFi',
    logo: 'https://assets.coingecko.com/coins/images/10775/standard/COMP.png',
    fallback: 'C',
    color: '#00d395'
  },
  {
    name: 'Aave Governance',
    url: 'https://governance.aave.com',
    description: 'The governance hub for the Aave lending and borrowing protocol.',
    category: 'DeFi',
    logo: 'https://assets.coingecko.com/coins/images/12645/standard/AAVE.png',
    fallback: 'A',
    color: '#b6509e'
  },
  {
    name: 'ENS DAO',
    url: 'https://discuss.ens.domains',
    description: 'Governance discussions for the Ethereum Name Service DAO.',
    category: 'Infrastructure',
    logo: 'https://cryptologos.cc/logos/ethereum-name-service-ens-logo.svg?v=025',
    fallback: 'E',
    color: '#5298ff'
  },
  {
    name: 'Optimism Governance',
    url: 'https://gov.optimism.io',
    description: 'Forum for the Optimism Collective — governing the OP Stack and ecosystem grants.',
    category: 'Layer 2',
    logo: 'https://assets.coingecko.com/coins/images/25244/standard/Optimism.png',
    fallback: 'O',
    color: '#ff0420'
  },
  {
    name: 'Arbitrum DAO Forum',
    url: 'https://forum.arbitrum.foundation',
    description: 'Governance hub for the Arbitrum DAO, managing the ARB treasury and protocol upgrades.',
    category: 'Layer 2',
    logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=025',
    fallback: 'Ar',
    color: '#28a0f0'
  },
  {
    name: 'GoodDollar Governance',
    url: 'https://discourse.gooddollar.org/',
    description: 'Official governance forum for the GoodDollar UBI protocol — vote on proposals shaping the future of universal basic income on Celo.',
    category: 'Social Impact',
    logo: '/gooddollar-logo.svg',
    fallback: 'G$',
    color: '#00c3ae'
  },
  {
    name: 'Celo Governance',
    url: 'https://forum.celo.org',
    description: 'Governance forum for the Celo blockchain — a mobile-first, carbon-negative L1.',
    category: 'Layer 1',
    logo: 'https://celo-org.github.io/celo-token-list/assets/celo_logo.svg',
    fallback: 'Ce',
    color: '#fbcc5c'
  },
];
