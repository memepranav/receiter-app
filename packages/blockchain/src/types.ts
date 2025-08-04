/**
 * Blockchain types and interfaces for the Quran reading app
 */

// Wallet Types
export interface WalletInfo {
  address: string;
  publicKey: string;
  balance: TokenBalance;
  isConnected: boolean;
  provider?: string;
}

export interface TokenBalance {
  amount: number;
  decimals: number;
  uiAmount: number;
  symbol: string;
}

export interface WalletAdapter {
  name: string;
  icon: string;
  url: string;
  readyState: WalletReadyState;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  signAllTransactions(transactions: any[]): Promise<any[]>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export enum WalletReadyState {
  Installed = 'Installed',
  NotDetected = 'NotDetected',
  Loadable = 'Loadable',
  Loading = 'Loading'
}

// Transaction Types
export interface BlockchainTransaction {
  id: string;
  signature: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  type: TransactionType;
  status: TransactionStatus;
  blockTime?: number;
  slot?: number;
  fee?: number;
  confirmations: number;
  metadata?: TransactionMetadata;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface TransactionMetadata {
  rewardId?: string;
  withdrawalId?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export enum TransactionType {
  REWARD_DISTRIBUTION = 'reward_distribution',
  WITHDRAWAL = 'withdrawal',
  STAKING = 'staking',
  UNSTAKING = 'unstaking',
  TRANSFER = 'transfer',
  BURN = 'burn',
  MINT = 'mint'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Smart Contract Types
export interface ContractCall {
  programId: string;
  instruction: string;
  accounts: ContractAccount[];
  data?: Uint8Array;
  signers: string[];
}

export interface ContractAccount {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

export interface ProgramAccount {
  address: string;
  data: any;
  executable: boolean;
  lamports: number;
  owner: string;
  rentEpoch: number;
}

// Token Types
export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  isInitialized: boolean;
  freezeAuthority?: string;
  mintAuthority?: string;
  logoURI?: string;
}

export interface TokenAccount {
  address: string;
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  delegate?: string;
  state: TokenAccountState;
  isNative: boolean;
  rentExemptReserve?: string;
  delegatedAmount?: string;
}

export enum TokenAccountState {
  Uninitialized = 'uninitialized',
  Initialized = 'initialized',
  Frozen = 'frozen'
}

// Staking Types
export interface StakeAccount {
  id: string;
  userWallet: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  apy: number;
  status: StakeStatus;
  rewards: StakeReward[];
  penalty?: number;
  autoRenew: boolean;
  lastClaimDate?: Date;
}

export interface StakeReward {
  amount: number;
  earnedAt: Date;
  claimedAt?: Date;
  status: 'pending' | 'claimed';
}

export enum StakeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  UNSTAKING = 'unstaking',
  CANCELLED = 'cancelled'
}

// Network Types
export interface NetworkInfo {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  isMainnet: boolean;
  isTestnet: boolean;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface NetworkStatus {
  connected: boolean;
  blockHeight: number;
  epochInfo: EpochInfo;
  transactionCount: number;
  averageBlockTime: number;
  health: 'ok' | 'behind' | 'unknown';
}

export interface EpochInfo {
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
  blockHeight: number;
  transactionCount: number;
}

// DeFi Types
export interface LiquidityPool {
  address: string;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  reserveA: number;
  reserveB: number;
  totalSupply: number;
  apy: number;
  volume24h: number;
  fees24h: number;
}

export interface LiquidityPosition {
  poolAddress: string;
  userAddress: string;
  lpTokens: number;
  shareOfPool: number;
  tokenAAmount: number;
  tokenBAmount: number;
  valueUSD: number;
  createdAt: Date;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  fee: number;
  route: SwapRoute[];
  slippage: number;
}

export interface SwapRoute {
  poolAddress: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  fee: number;
}

// Governance Types
export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  votingPower: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  startTime: Date;
  endTime: Date;
  executionTime?: Date;
  quorumRequired: number;
  threshold: number;
}

export enum ProposalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUCCEEDED = 'succeeded',
  DEFEATED = 'defeated',
  QUEUED = 'queued',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled'
}

export interface Vote {
  proposalId: string;
  voter: string;
  support: VoteType;
  votingPower: number;
  reason?: string;
  timestamp: Date;
}

export enum VoteType {
  FOR = 'for',
  AGAINST = 'against',
  ABSTAIN = 'abstain'
}

// Multi-signature Types
export interface MultisigAccount {
  address: string;
  owners: string[];
  threshold: number;
  nonce: number;
  pendingTransactions: PendingTransaction[];
}

export interface PendingTransaction {
  id: string;
  multisigAddress: string;
  instruction: any;
  signatures: MultisigSignature[];
  requiredSignatures: number;
  status: 'pending' | 'approved' | 'executed' | 'cancelled';
  createdAt: Date;
  expiresAt?: Date;
}

export interface MultisigSignature {
  owner: string;
  signature: string;
  signedAt: Date;
}

// Oracle Types
export interface PriceOracle {
  symbol: string;
  price: number;
  priceUSD: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
  source: string;
}

export interface PriceFeed {
  account: string;
  aggregator: string;
  description: string;
  decimals: number;
  roundId: number;
  answer: number;
  startedAt: Date;
  updatedAt: Date;
  answeredInRound: number;
}

// Bridge Types
export interface BridgeTransfer {
  id: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: number;
  fee: number;
  status: BridgeStatus;
  fromTxHash?: string;
  toTxHash?: string;
  createdAt: Date;
  completedAt?: Date;
}

export enum BridgeStatus {
  INITIATED = 'initiated',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Event Types
export interface BlockchainEvent {
  id: string;
  type: EventType;
  transaction: string;
  blockNumber: number;
  logIndex: number;
  address: string;
  data: any;
  topics: string[];
  timestamp: Date;
}

export enum EventType {
  TRANSFER = 'Transfer',
  APPROVAL = 'Approval',
  MINT = 'Mint',
  BURN = 'Burn',
  STAKE = 'Stake',
  UNSTAKE = 'Unstake',
  REWARD_CLAIM = 'RewardClaim',
  VOTE_CAST = 'VoteCast',
  PROPOSAL_CREATED = 'ProposalCreated'
}

// Gas/Fee Types
export interface GasEstimate {
  gasLimit: number;
  gasPrice: number;
  maxFeePerGas?: number;
  maxPriorityFeePerGas?: number;
  totalCost: number;
  totalCostUSD: number;
}

export interface FeeStructure {
  baseFee: number;
  priorityFee: number;
  networkFee: number;
  serviceFee: number;
  totalFee: number;
}

// Error Types
export interface BlockchainError {
  code: number;
  message: string;
  type: ErrorType;
  transaction?: string;
  blockNumber?: number;
  gasUsed?: number;
  nativeError?: any;
}

export enum ErrorType {
  NETWORK_ERROR = 'NetworkError',
  TRANSACTION_ERROR = 'TransactionError',
  VALIDATION_ERROR = 'ValidationError',
  INSUFFICIENT_FUNDS = 'InsufficientFunds',
  GAS_ERROR = 'GasError',
  TIMEOUT_ERROR = 'TimeoutError',
  CONTRACT_ERROR = 'ContractError'
}

// Configuration Types
export interface BlockchainConfig {
  network: string;
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl: string;
  chainId: string | number;
  currency: string;
  contractAddresses: Record<string, string>;
  confirmations: number;
  gasPrice?: number;
  gasMultiplier?: number;
  timeout: number;
}

export interface WalletConfig {
  autoConnect: boolean;
  persistConnection: boolean;
  supportedWallets: string[];
  defaultWallet?: string;
  timeout: number;
}

// Utility Types
export type Address = string;
export type Hash = string;
export type BigNumber = string | number;
export type Timestamp = number | Date;

